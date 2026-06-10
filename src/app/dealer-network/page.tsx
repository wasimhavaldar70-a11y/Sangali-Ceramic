'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Search, MapPin, Phone, Mail, Compass, Star,
  CheckCircle2, ArrowRight, UserPlus, Info
} from 'lucide-react';
import { dbService, Dealer } from '@/lib/supabase';
import { leadSchema } from '@/lib/validations/lead';

export default function DealerNetworkPage() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);

  // Form states
  const [compName, setCompName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchDealers = async () => {
      const data = await dbService.getDealers();
      setDealers(data);
      if (data.length > 0) {
        // Default select Sangli Ceramica
        setSelectedDealer(data[0]);
      }
    };
    fetchDealers();
  }, []);

  // Filtered dealers
  const filteredDealers = dealers.filter(d => {
    const matchesState = selectedState === 'All' || d.state.toLowerCase() === selectedState.toLowerCase();
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.state.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesState && matchesSearch;
  });

  const handleDealerSelect = (dealer: Dealer) => {
    setSelectedDealer(dealer);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    const result = leadSchema.safeParse({ name: contactPerson, email, phone, message: msg });
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        if (issue.path[0]) errs[issue.path[0].toString()] = issue.message;
      });
      setValidationErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await dbService.insertLead({
        type: 'dealer_request',
        name: `${contactPerson} (${compName})`,
        phone,
        email,
        message: `Dealer Registration Request. Location: ${city}, ${state}. Remarks: ${msg}`,
        extra_data: { company: compName, state, city },
        status: 'new'
      });
      setSubmitted(true);
      setCompName('');
      setContactPerson('');
      setPhone('');
      setEmail('');
      setState('');
      setCity('');
      setMsg('');
      setValidationErrors({});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statesList = ['All', 'Maharashtra', 'Delhi', 'Karnataka', 'Gujarat', 'Tamil Nadu'];

  return (
    <div className="bg-dark-black text-white pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-8">
        <Link href="/" className="flex items-center gap-2 text-xs text-white/50 hover:text-primary-gold transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      {/* Hero Header */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 text-center mb-16">
        <span className="text-primary-gold text-xs tracking-[0.35em] uppercase font-semibold">Exquisite Presence</span>
        <h1 className="font-display text-4xl md:text-6xl font-bold mt-2 text-gold-gradient">Our Dealer Network</h1>
        <p className="text-white/60 text-sm font-light mt-4 max-w-xl mx-auto">
          Locate our luxury showrooms and authorized vitrified slab galleries across India to experience tiles first hand.
        </p>
      </section>

      {/* Main Map & Directory Grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Side: interactive map & selected detail */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-[#0F0F0F] border border-white/5 p-6 relative">
            <h3 className="font-display text-lg font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-5 h-5 text-primary-gold" /> Showroom Locator Map
            </h3>
            
            {/* Interactive SVG Stylized Map of India */}
            <div className="relative w-full h-[400px] bg-dark-black/40 border border-white/5 flex items-center justify-center p-4">
              {/* Stylized geometric background outline map of India */}
              <svg 
                viewBox="0 0 400 450" 
                className="w-full h-full max-h-[380px] text-neutral-800"
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5"
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                {/* Simplified border paths of India */}
                <path d="M190 40 L210 50 L220 70 L215 90 L230 100 L240 120 L270 125 L290 145 L290 170 L280 180 L295 195 L270 200 L250 205 L245 220 L240 240 L230 255 L245 260 L240 270 L250 280 L230 300 L220 315 L200 350 L195 380 L185 410 L178 430 L170 410 L165 370 L150 350 L135 320 L125 290 L130 270 L120 250 L122 230 L100 215 L85 210 L60 215 L50 200 L65 180 L80 175 L85 160 L105 150 L115 130 L135 120 L145 90 L160 85 L165 60 L180 50 Z" className="fill-neutral-900 stroke-neutral-800 transition-colors duration-500 hover:fill-neutral-900/80" />
                
                {/* Glowing Dealer Pins */}
                {dealers.map((dealer) => {
                  // Approximate coordinates projection onto local SVG frame
                  // deal-1 (Sangli): lat 16.8524, lng 74.5816 -> x: 190, y: 310
                  // deal-2 (Mumbai): lat 19.1176, lng 72.9060 -> x: 170, y: 280
                  // deal-3 (Delhi): lat 28.6415, lng 77.1209 -> x: 195, y: 155
                  // deal-4 (Bengaluru): lat 12.9784, lng 77.6408 -> x: 200, y: 360
                  // deal-5 (Ahmedabad): lat 23.0225, lng 72.5714 -> x: 150, y: 220
                  // deal-6 (Chennai): lat 13.0305, lng 80.2354 -> x: 230, y: 360
                  const coordMap: Record<string, { x: number; y: number }> = {
                    'deal-1': { x: 190, y: 310 },
                    'deal-2': { x: 170, y: 280 },
                    'deal-3': { x: 195, y: 155 },
                    'deal-4': { x: 200, y: 360 },
                    'deal-5': { x: 150, y: 220 },
                    'deal-6': { x: 230, y: 360 }
                  };
                  const pos = coordMap[dealer.id] || { x: 200, y: 250 };
                  const isSelected = selectedDealer?.id === dealer.id;

                  return (
                    <g 
                      key={dealer.id}
                      onClick={() => handleDealerSelect(dealer)}
                      className="cursor-pointer group"
                    >
                      {/* Pulse circle */}
                      <circle 
                        cx={pos.x} 
                        cy={pos.y} 
                        r={isSelected ? 10 : 6} 
                        className={`fill-primary-gold/30 stroke-none ${isSelected ? 'animate-ping' : 'group-hover:animate-ping'}`} 
                      />
                      {/* Inner gold core dot */}
                      <circle 
                        cx={pos.x} 
                        cy={pos.y} 
                        r={isSelected ? 5 : 4} 
                        className={`fill-primary-gold stroke-white stroke-[1.5] transition-all duration-300 ${isSelected ? 'scale-125 fill-white' : ''}`}
                      />
                      {/* State tooltip on hover */}
                      <text 
                        x={pos.x + 8} 
                        y={pos.y + 4} 
                        className="text-[9px] font-sans font-semibold tracking-wider fill-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      >
                        {dealer.city}
                      </text>
                    </g>
                  );
                })}
              </svg>

              <div className="absolute top-4 right-4 bg-dark-black/85 p-3 text-[10px] text-white/50 border border-white/5 uppercase tracking-wider flex flex-col gap-1.5 pointer-events-none">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-gold inline-block" /> Authorized Galleries
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-gold animate-ping inline-block" /> Selected Showroom
                </div>
              </div>
            </div>
          </div>

          {/* Selected Dealer Detailed Address Card */}
          {selectedDealer && (
            <div className="bg-charcoal border border-primary-gold/25 p-8 shadow-xl">
              <span className="text-primary-gold text-[10px] uppercase tracking-widest font-semibold">{selectedDealer.state} Region</span>
              <h3 className="font-display text-2xl font-bold mt-1 mb-4 text-gold-gradient">{selectedDealer.name}</h3>
              
              <div className="space-y-4 text-sm text-white/80">
                <div className="flex gap-3 items-start">
                  <MapPin className="w-4 h-4 text-primary-gold shrink-0 mt-1" />
                  <span>{selectedDealer.address}</span>
                </div>
                <div className="flex gap-3 items-center">
                  <Phone className="w-4 h-4 text-primary-gold shrink-0" />
                  <span>{selectedDealer.phone}</span>
                </div>
                {selectedDealer.email && (
                  <div className="flex gap-3 items-center">
                    <Mail className="w-4 h-4 text-primary-gold shrink-0" />
                    <span>{selectedDealer.email}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-8 pt-6 border-t border-white/5">
                <a
                  href={`tel:${selectedDealer.phone}`}
                  className="flex-1 py-3 bg-gold-gradient text-dark-black font-semibold text-center uppercase tracking-wider text-xs hover:bg-gold-gradient-hover"
                >
                  Call Showroom
                </a>
                <button
                  onClick={() => alert(`Directions mapping: Redirecting to Google Maps for coordinates ${selectedDealer.coords?.lat}, ${selectedDealer.coords?.lng}...`)}
                  className="flex-1 py-3 border border-white/10 text-white font-semibold text-center uppercase tracking-wider text-xs hover:bg-white hover:text-dark-black"
                >
                  Get Directions
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Directory List & Become a Dealer form */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          {/* Dealer Directory filter/list */}
          <div className="bg-[#0F0F0F] border border-white/5 p-6 flex flex-col h-[400px] justify-between">
            <div>
              <h3 className="font-display text-lg font-bold mb-4 uppercase tracking-wider">Showroom Directory</h3>
              
              {/* State filter tabs */}
              <div className="flex flex-wrap gap-1.5 mb-4 border-b border-white/5 pb-3">
                {statesList.map(st => (
                  <button
                    key={st}
                    onClick={() => setSelectedState(st)}
                    className={`px-3 py-1.5 text-[9px] uppercase tracking-widest border transition-colors ${
                      selectedState === st
                        ? 'border-primary-gold text-primary-gold font-semibold'
                        : 'border-white/5 hover:border-white/10 text-white/50'
                    }`}
                  >
                    {st.split(' ')[0]}
                  </button>
                ))}
              </div>

              {/* Directory search input */}
              <div className="relative mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by city, name..."
                  className="w-full bg-charcoal border border-white/10 py-2.5 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-primary-gold"
                />
                <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* List */}
            <div className="space-y-2.5 overflow-y-auto pr-1 flex-grow pr-2 no-scrollbar">
              {filteredDealers.length === 0 ? (
                <p className="text-xs text-white/40 text-center py-8">No showrooms found in this region.</p>
              ) : (
                filteredDealers.map(dealer => (
                  <button
                    key={dealer.id}
                    onClick={() => handleDealerSelect(dealer)}
                    className={`w-full p-3 border text-left flex justify-between items-center transition-colors ${
                      selectedDealer?.id === dealer.id
                        ? 'border-primary-gold bg-primary-gold/5'
                        : 'border-white/5 hover:border-white/10 bg-charcoal/20'
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white leading-snug">{dealer.name}</h4>
                      <p className="text-[10px] text-white/45 mt-0.5">{dealer.city}, {dealer.state}</p>
                    </div>
                    <MapPin className={`w-4 h-4 ${selectedDealer?.id === dealer.id ? 'text-primary-gold' : 'text-white/20'}`} />
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Become a Dealer Form */}
          <div className="bg-charcoal border border-white/5 p-8">
            {submitted ? (
              <div className="text-center py-6 flex flex-col items-center">
                <CheckCircle2 className="w-12 h-12 text-primary-gold mb-3 animate-pulse" />
                <h4 className="font-display text-xl text-gold-gradient mb-2">Registration Submitted</h4>
                <p className="text-white/60 text-xs max-w-xs leading-relaxed">
                  Thank you! Our wholesale distributions team will review your credentials and contact your firm within 3 business days.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <h3 className="font-display text-lg font-bold uppercase tracking-wider flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-primary-gold" /> Become an Authorized Dealer
                </h3>
                <p className="text-white/40 text-[10px] uppercase tracking-wider mb-4">
                  Partner with the fastest-growing luxury vitrified slab brand in India.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-white/50 mb-1">Company / Firm Name *</label>
                    <input
                      type="text"
                      required
                      value={compName}
                      onChange={(e) => setCompName(e.target.value)}
                      placeholder="e.g. Sangli Marbles"
                      className="w-full bg-dark-black border border-white/5 px-3 py-2 text-xs focus:outline-none focus:border-primary-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-white/50 mb-1">Contact Person *</label>
                    <input
                      type="text"
                      required
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="e.g. Ramesh Patil"
                      className={`w-full bg-dark-black border px-3 py-2 text-xs focus:outline-none focus:border-primary-gold ${validationErrors.name ? 'border-red-500' : 'border-white/5'}`}
                    />
                    {validationErrors.name && <p className="text-red-500 text-[10px] mt-1">{validationErrors.name}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-white/50 mb-1">Phone *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className={`w-full bg-dark-black border px-3 py-2 text-xs focus:outline-none focus:border-primary-gold ${validationErrors.phone ? 'border-red-500' : 'border-white/5'}`}
                    />
                    {validationErrors.phone && <p className="text-red-500 text-[10px] mt-1">{validationErrors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-white/50 mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. info@firm.com"
                      className={`w-full bg-dark-black border px-3 py-2 text-xs focus:outline-none focus:border-primary-gold ${validationErrors.email ? 'border-red-500' : 'border-white/5'}`}
                    />
                    {validationErrors.email && <p className="text-red-500 text-[10px] mt-1">{validationErrors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-white/50 mb-1">State *</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Maharashtra"
                      className="w-full bg-dark-black border border-white/5 px-3 py-2 text-xs focus:outline-none focus:border-primary-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-white/50 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Sangli"
                      className="w-full bg-dark-black border border-white/5 px-3 py-2 text-xs focus:outline-none focus:border-primary-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-white/50 mb-1">Business Details / Showroom Area</label>
                  <textarea
                    rows={2}
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    placeholder="Specify showroom size, current marble/tiles brands distributed..."
                    className={`w-full bg-dark-black border px-3 py-2 text-xs focus:outline-none focus:border-primary-gold resize-none ${validationErrors.message ? 'border-red-500' : 'border-white/5'}`}
                  ></textarea>
                  {validationErrors.message && <p className="text-red-500 text-[10px] mt-1">{validationErrors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-gold-gradient text-dark-black font-semibold uppercase tracking-wider text-xs hover:bg-gold-gradient-hover flex justify-center items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Submitting request...' : 'Submit Dealership Request'} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
