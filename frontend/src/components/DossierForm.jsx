import React, { useState } from 'react';
import { ShieldAlert, PlusCircle, Paperclip } from 'lucide-react';

export default function DossierForm() {
  const maxFileSize = 5 * 1024 * 1024;
  const [formData, setFormData] = useState({
    plate: '',
    reason: '',
    firNo: '',
    policeStation: 'Hazratganj Kotwali',
    district: 'Lucknow',
    ioName: '',
    ioContact: '',
    firFile: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormMessage(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size === 0) {
      setFormData({ ...formData, firFile: null });
      setFormMessage({ type: 'error', text: 'FIR attachment cannot be empty.' });
      e.target.value = '';
      return;
    }
    if (file.size > maxFileSize) {
      setFormData({ ...formData, firFile: null });
      setFormMessage({ type: 'error', text: 'FIR attachment must be 5 MiB or smaller.' });
      e.target.value = '';
      return;
    }
    if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
      setFormData({ ...formData, firFile: null });
      setFormMessage({ type: 'error', text: 'Choose a PDF or image file for the FIR attachment.' });
      e.target.value = '';
      return;
    }
    setFormData({ ...formData, firFile: file });
    setFormMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setIsSubmitting(true);
    setFormMessage(null);

    try {
      const payload = {
        plate: formData.plate.toUpperCase().trim(),
        reason: formData.reason.trim() || 'Hotlist Flagged',
        active: true,
        fir_no: formData.firNo.trim() || null,
        police_station: formData.policeStation.trim() || null,
        district: formData.district.trim() || null,
        io_name: formData.ioName.trim() || null,
        io_contact: formData.ioContact.trim() || null
      };
      if (formData.firFile) {
        const fileDataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error('Could not read the selected FIR attachment.'));
          reader.readAsDataURL(formData.firFile);
        });
        payload.fir_file_name = formData.firFile.name;
        payload.fir_file_type = formData.firFile.type;
        payload.fir_file_data = fileDataUrl.split(',')[1];
      }

      const res = await fetch('http://localhost:8000/api/hotlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const responseBody = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(responseBody?.detail || `Request failed (${res.status}).`);
      }

      setFormMessage({ type: 'success', text: `Target ${payload.plate} saved to the hotlist.` });
      setFormData({
        plate: '',
        reason: '',
        firNo: '',
        policeStation: 'Hazratganj Kotwali',
        district: 'Lucknow',
        ioName: '',
        ioContact: '',
        firFile: null
      });
      form.reset();
      window.dispatchEvent(new Event('hotlist-updated'));
    } catch (err) {
      setFormMessage({ type: 'error', text: `Could not save the dossier: ${err.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#1b2034',
      border: '1px solid #28304c',
      borderRadius: '8px',
      padding: '20px',
      fontFamily: "'Inter', sans-serif",
      boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #28304c', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f05a3e', fontSize: '14px', fontWeight: '700' }}>
          <ShieldAlert size={18} /> HOTLIST TARGET REGISTRATION & DOSSIER AUDIT
        </div>
        <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: '600' }}>
          CASE DETAILS • PDF OR IMAGE UP TO 5 MiB
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {formMessage && (
          <div
            role={formMessage.type === 'error' ? 'alert' : 'status'}
            aria-live="polite"
            style={{
              color: formMessage.type === 'error' ? '#fca5a5' : '#6ee7b7',
              backgroundColor: formMessage.type === 'error' ? 'rgba(240, 90, 62, 0.12)' : 'rgba(16, 185, 129, 0.12)',
              border: `1px solid ${formMessage.type === 'error' ? '#f05a3e' : '#10b981'}`,
              borderRadius: '6px',
              padding: '10px 12px',
              fontSize: '12px'
            }}
          >
            {formMessage.text}
          </div>
        )}
        
        {/* ROW 1: VEHICLE & FIR DETAILS */}
        <div className="dossier-form-grid dossier-form-grid-primary" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '11px', color: '#8e9ab0', display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              VEHICLE LICENSE PLATE *
            </label>
            <input 
              type="text" 
              name="plate"
              placeholder="e.g. UP32AB1234" 
              value={formData.plate}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px 12px', backgroundColor: '#131726', border: '1px solid #28304c', borderRadius: '6px', color: '#ffffff', fontSize: '12px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#8e9ab0', display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              FIR NUMBER / CASE NO. *
            </label>
            <input 
              type="text" 
              name="firNo"
              placeholder="e.g. FIR-2026/892" 
              value={formData.firNo}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px 12px', backgroundColor: '#131726', border: '1px solid #28304c', borderRadius: '6px', color: '#ffffff', fontSize: '12px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#8e9ab0', display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              CRIME CATEGORY / REASON
            </label>
            <input 
              type="text" 
              name="reason"
              placeholder="e.g. Armed Robbery / Stolen Auto" 
              value={formData.reason}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px 12px', backgroundColor: '#131726', border: '1px solid #28304c', borderRadius: '6px', color: '#ffffff', fontSize: '12px', outline: 'none' }}
            />
          </div>
        </div>

        {/* ROW 2: POLICE JURISDICTION & IO DETAILS */}
        <div className="dossier-form-grid dossier-form-grid-secondary" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '11px', color: '#8e9ab0', display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              POLICE STATION
            </label>
            <input 
              type="text" 
              name="policeStation"
              placeholder="Hazratganj Kotwali, Lucknow" 
              value={formData.policeStation}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px 12px', backgroundColor: '#131726', border: '1px solid #28304c', borderRadius: '6px', color: '#ffffff', fontSize: '12px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#8e9ab0', display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              DISTRICT
            </label>
            <input
              type="text"
              name="district"
              placeholder="Lucknow"
              value={formData.district}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px 12px', backgroundColor: '#131726', border: '1px solid #28304c', borderRadius: '6px', color: '#ffffff', fontSize: '12px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#8e9ab0', display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              INVESTIGATING OFFICER (IO)
            </label>
            <input 
              type="text" 
              name="ioName"
              placeholder="e.g. SI R.K. Singh" 
              value={formData.ioName}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px 12px', backgroundColor: '#131726', border: '1px solid #28304c', borderRadius: '6px', color: '#ffffff', fontSize: '12px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#8e9ab0', display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              IO CONTACT NUMBER
            </label>
            <input 
              type="text" 
              name="ioContact"
              placeholder="+91 94150 00000" 
              value={formData.ioContact}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px 12px', backgroundColor: '#131726', border: '1px solid #28304c', borderRadius: '6px', color: '#ffffff', fontSize: '12px', outline: 'none' }}
            />
          </div>

          {/* FIR DOCUMENT ATTACHMENT */}
          <div>
            <label style={{ fontSize: '11px', color: '#f59e0b', display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              ATTACH FIR COPY
            </label>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', backgroundColor: '#131726', border: '1px dashed #f59e0b', borderRadius: '6px', color: '#f59e0b', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>
              <Paperclip size={14} />
              {formData.firFile ? formData.firFile.name : 'UPLOAD FIR COPY (MAX 5 MiB)'}
              <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{ backgroundColor: '#f05a3e', border: 'none', color: '#ffffff', padding: '10px 24px', borderRadius: '6px', fontWeight: '700', cursor: isSubmitting ? 'wait' : 'pointer', opacity: isSubmitting ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', boxShadow: '0 4px 12px rgba(240, 90, 62, 0.3)' }}
          >
            <PlusCircle size={16} /> {isSubmitting ? 'SAVING DOSSIER...' : 'REGISTER TARGET IN HOTLIST'}
          </button>
        </div>

      </form>
    </div>
  );
}