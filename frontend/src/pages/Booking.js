import React, { useEffect, useState } from 'react';
import { FaClock, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';

const steps = [
  { id: 1, title: 'Select Service' },
  { id: 2, title: 'Choose Time' },
  { id: 3, title: 'Your Details' },
  { id: 4, title: 'Review & Confirm' }
];

const Booking = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [date, setDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slot, setSlot] = useState('');

  // Service selection
  const [selectedService, setSelectedService] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [vehicleType, setVehicleType] = useState('sedan');
  const [serviceType, setServiceType] = useState('service'); // 'service' or 'package'
  const [pricing, setPricing] = useState(null);

  // Customer details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);


  // Load services and packages on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('Loading services and packages...');
        console.log('API base URL:', api.defaults.baseURL);
        
        const [servicesRes, packagesRes] = await Promise.all([
          api.get('/api/services'),
          api.get('/api/service-packages')
        ]);
        
        console.log('Services response:', servicesRes.data);
        console.log('Packages response:', packagesRes.data);
        
        setServices(servicesRes.data.services);
        setPackages(packagesRes.data.packages);
      } catch (error) {
        console.error('Error loading services/packages:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: error.config
        });
        toast.error(`Failed to load services: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Check URL parameters for pre-selected service/package
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get('service');
    const packageId = urlParams.get('package');
    const type = urlParams.get('type');

    if (serviceId && type === 'single') {
      setServiceType('service');
      const service = services.find(s => s.id === parseInt(serviceId));
      if (service) {
        setSelectedService(service);
        setCurrentStep(2);
      }
    } else if (packageId && type === 'package') {
      setServiceType('package');
      const packageData = packages.find(p => p.id === parseInt(packageId));
      if (packageData) {
        setSelectedPackage(packageData);
        setCurrentStep(2);
      }
    }
  }, [services, packages]);

  // Calculate pricing when service/package or vehicle type changes
  useEffect(() => {
    if (!selectedService && !selectedPackage) return;

    const calculatePricing = async () => {
      try {
        if (serviceType === 'service' && selectedService) {
          const response = await api.post('/api/services/calculate-price', {
            serviceId: selectedService.id,
            vehicleType
          });
          setPricing(response.data);
        } else if (serviceType === 'package' && selectedPackage) {
          const response = await api.post(`/api/service-packages/${selectedPackage.id}/calculate-price`, {
            vehicleType
          });
          setPricing(response.data);
        }
      } catch (error) {
        console.error('Error calculating pricing:', error);
      }
    };

    calculatePricing();
  }, [selectedService, selectedPackage, vehicleType, serviceType]);

  // Load available slots when date changes
  useEffect(() => {
    if (!date || (!selectedService && !selectedPackage)) {
      setAvailableSlots([]);
      setSlot('');
      return;
    }
    
    setSlotsLoading(true);
    setSlot('');
    
    // Calculate estimated duration
    const duration = serviceType === 'service' 
      ? selectedService?.duration_minutes || 60
      : selectedPackage?.duration_minutes || 120;
    
    api
      .get('/api/bookings/availability', { params: { date, duration } })
      .then(({ data }) => {
        setAvailableSlots(data?.slots || []);
        if (data?.closed) toast.info('We are closed on the selected date.');
      })
      .catch(() => toast.error('Failed to load availability'))
      .finally(() => setSlotsLoading(false));
  }, [date, selectedService, selectedPackage, serviceType]);

  const canProceedStep1 = (selectedService || selectedPackage);
  const canProceedStep2 = date && slot;
  const canProceedStep3 = name && email;

  const goNext = () => setCurrentStep((s) => Math.min(4, s + 1));
  const goBack = () => setCurrentStep((s) => Math.max(1, s - 1));

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const serviceName = serviceType === 'service' 
        ? selectedService?.name 
        : selectedPackage?.name;
      
      await api.post('/api/bookings', {
        name,
        email,
        phone,
        service: serviceName,
        date,
        timeSlot: slot,
        notes,
        vehicleType,
        serviceType,
        serviceId: selectedService?.id,
        packageId: selectedPackage?.id
      });
      toast.success('Booking request submitted! We will confirm shortly.');
      // Reset and go to step 1
      setCurrentStep(1);
      setDate('');
      setSlot('');
      setName('');
      setEmail('');
      setPhone('');
      setNotes('');
      setSelectedService(null);
      setSelectedPackage(null);
      setServiceType('service');
      setPricing(null);
    } catch (err) {
      if (err?.response?.status === 409) {
        toast.error('That slot was just booked. Please choose another.');
        try {
          const { data } = await api.get('/api/bookings/availability', { params: { date } });
          setAvailableSlots(data?.slots || []);
        } catch (_) {}
        setCurrentStep(2);
      } else {
        toast.error('Failed to submit booking');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-secondary-dark flex items-center justify-center">
        <div className="text-center text-white">
          <div className="spinner mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Loading Services...</h2>
          <p className="text-white/80">Please wait while we load our services and packages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-secondary-dark">
      <div className="relative min-h-screen py-12">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Book an Appointment</h2>
            <p className="text-xl text-white/90">Quick, friendly, and step-by-step—like a simple form.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              {steps.map((s, idx) => (
                <div key={s.id} className="flex items-center flex-1">
                  <div className={`flex flex-col items-center ${
                    currentStep === s.id ? 'text-secondary' : 
                    currentStep > s.id ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-2 ${
                      currentStep === s.id ? 'bg-secondary text-white' : 
                      currentStep > s.id ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {currentStep > s.id ? <FaCheck /> : s.id}
                    </div>
                    <div className="text-sm font-medium text-center">{s.title}</div>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      currentStep > s.id ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-primary mb-6">Select Your Service</h3>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type:</label>
                    <select 
                      value={vehicleType} 
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="form-control max-w-xs mx-auto"
                    >
                      <option value="sedan">Sedan</option>
                      <option value="suv">SUV</option>
                      <option value="truck">Truck</option>
                    </select>
                  </div>

                  <div className="flex justify-center gap-4 mb-8">
                    <button 
                      className={`px-6 py-3 rounded-lg font-medium transition-all ${
                        serviceType === 'service' 
                          ? 'bg-secondary text-white shadow-lg' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      onClick={() => setServiceType('service')}
                    >
                      Individual Services
                    </button>
                    <button 
                      className={`px-6 py-3 rounded-lg font-medium transition-all ${
                        serviceType === 'package' 
                          ? 'bg-secondary text-white shadow-lg' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      onClick={() => setServiceType('package')}
                    >
                      Service Packages
                    </button>
                  </div>

                  {serviceType === 'service' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {services.map(service => (
                        <div 
                          key={service.id}
                          className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                            selectedService?.id === service.id 
                              ? 'border-secondary bg-secondary/5 shadow-lg' 
                              : 'border-gray-200 hover:border-secondary hover:shadow-md'
                          }`}
                          onClick={() => setSelectedService(service)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-primary mb-2">{service.name}</h4>
                              <p className="text-gray-600 mb-4">{service.description}</p>
                              <div className="flex justify-between items-center text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <FaClock /> {formatDuration(service.duration_minutes)}
                                </span>
                                <span className="font-semibold text-secondary">From RM {service.base_price.toFixed(2)}</span>
                              </div>
                            </div>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ml-4 ${
                              selectedService?.id === service.id 
                                ? 'bg-secondary text-white' 
                                : 'border-2 border-gray-300'
                            }`}>
                              {selectedService?.id === service.id && <FaCheck className="text-sm" />}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {serviceType === 'package' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {packages.map(packageData => (
                        <div 
                          key={packageData.id}
                          className={`p-6 border-2 rounded-xl cursor-pointer transition-all relative ${
                            selectedPackage?.id === packageData.id 
                              ? 'border-secondary bg-secondary/5 shadow-lg' 
                              : 'border-gray-200 hover:border-secondary hover:shadow-md'
                          }`}
                          onClick={() => setSelectedPackage(packageData)}
                        >
                          {packageData.is_popular && (
                            <div className="absolute -top-2 -right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                              Popular
                            </div>
                          )}
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-primary mb-2">{packageData.name}</h4>
                              <p className="text-gray-600 mb-4">{packageData.description}</p>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-1 text-gray-500">
                                  <FaClock /> {formatDuration(packageData.duration_minutes)}
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="font-semibold text-secondary text-lg">RM {packageData.finalPrice.toFixed(2)}</span>
                                  <span className="text-green-600 font-medium">Save RM {packageData.savings.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ml-4 ${
                              selectedPackage?.id === packageData.id 
                                ? 'bg-secondary text-white' 
                                : 'border-2 border-gray-300'
                            }`}>
                              {selectedPackage?.id === packageData.id && <FaCheck className="text-sm" />}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {pricing && (
                    <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                      <h4 className="text-lg font-semibold text-primary mb-4">Price Summary</h4>
                      <div className="space-y-2">
                        {serviceType === 'service' ? (
                          <>
                            <div className="flex justify-between">
                              <span>Base Price:</span>
                              <span>RM {pricing.basePrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Vehicle Multiplier ({pricing.vehicleType}):</span>
                              <span>{pricing.multiplier}x</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg text-primary pt-2 border-t">
                              <span>Final Price:</span>
                              <span>RM {pricing.finalPrice.toFixed(2)}</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between">
                              <span>Package Price:</span>
                              <span>RM {pricing.packagePrice.finalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Individual Price:</span>
                              <span>RM {pricing.individualPricing.totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg text-green-600 pt-2 border-t">
                              <span>You Save:</span>
                              <span>RM {pricing.individualPricing.savings.toFixed(2)}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-8">
                  <button 
                    className="btn" 
                    disabled={!canProceedStep1} 
                    onClick={goNext}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-primary mb-6">Choose Date & Time</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Selected Service</label>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="font-semibold text-primary mb-2">
                          {serviceType === 'service' ? selectedService?.name : selectedPackage?.name}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <FaClock /> {formatDuration(serviceType === 'service' ? selectedService?.duration_minutes : selectedPackage?.duration_minutes)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Available time slots</label>
                    {slotsLoading ? (
                      <p className="text-gray-500 text-center py-4">Loading slots...</p>
                    ) : date ? (
                      availableSlots.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {availableSlots.map((s) => (
                            <button
                              key={s}
                              type="button"
                              className={`p-3 rounded-lg border-2 transition-all ${
                                slot === s 
                                  ? 'border-secondary bg-secondary text-white' 
                                  : 'border-gray-200 hover:border-secondary hover:bg-secondary/5'
                              }`}
                              onClick={() => setSlot(s)}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">No slots available or closed for the selected date.</p>
                      )
                    ) : (
                      <p className="text-gray-500 text-center py-4">Pick a date to view availability.</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button className="btn btn-outline" onClick={goBack}>Back</button>
                  <button className="btn" disabled={!canProceedStep2} onClick={goNext}>Next</button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-primary mb-6">Your Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
                      <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
                    </div>
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+60 1xxxxxxxx" />
                    </div>
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
                      <input className="form-control" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special requests" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button className="btn btn-outline" onClick={goBack}>Back</button>
                  <button className="btn" disabled={!canProceedStep3} onClick={goNext}>Next</button>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-primary mb-6">Review & Confirm</h3>
                  
                  <div className="bg-gray-50 rounded-xl p-6 space-y-6">
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-primary">Service Details</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Service:</span>
                          <span className="font-medium">{serviceType === 'service' ? selectedService?.name : selectedPackage?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Vehicle Type:</span>
                          <span className="font-medium">{vehicleType.toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium">{formatDuration(serviceType === 'service' ? selectedService?.duration_minutes : selectedPackage?.duration_minutes)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-primary">Appointment</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date:</span>
                          <span className="font-medium">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Time:</span>
                          <span className="font-medium">{slot}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-primary">Customer Information</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium">{name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium">{email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-medium">{phone || 'Not provided'}</span>
                        </div>
                        {notes && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Notes:</span>
                            <span className="font-medium">{notes}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {pricing && (
                      <div className="space-y-3 border-t pt-4">
                        <h4 className="text-lg font-semibold text-primary">Pricing</h4>
                        {serviceType === 'service' ? (
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Base Price:</span>
                              <span>RM {pricing.basePrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Vehicle Multiplier ({pricing.vehicleType}):</span>
                              <span>{pricing.multiplier}x</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg text-primary pt-2 border-t">
                              <span>Total Price:</span>
                              <span>RM {pricing.finalPrice.toFixed(2)}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Package Price:</span>
                              <span>RM {pricing.packagePrice.finalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Individual Price:</span>
                              <span>RM {pricing.individualPricing.totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg text-green-600 pt-2 border-t">
                              <span>You Save:</span>
                              <span>RM {pricing.individualPricing.savings.toFixed(2)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button className="btn btn-outline" onClick={goBack}>Back</button>
                  <button className="btn" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Confirm Booking'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;


