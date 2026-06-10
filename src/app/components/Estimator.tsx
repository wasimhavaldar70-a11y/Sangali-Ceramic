"use client";

import { useState } from 'react';
import styles from './Estimator.module.css';

type Step = 1 | 2 | 3 | 4 | 5;

export default function Estimator() {
  const [step, setStep] = useState<Step>(1);
  const [projectType, setProjectType] = useState('');
  const [tier, setTier] = useState('');
  const [size, setSize] = useState('');
  const [estimate, setEstimate] = useState<{min: number, max: number} | null>(null);

  const handleNext = () => setStep((s) => (s + 1) as Step);
  
  const calculateEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy logic for estimate calculation
    let base = 50000;
    if (projectType === 'Whole Home') base = 250000;
    if (projectType === 'Kitchen') base = 80000;
    
    let multiplier = 1;
    if (tier === 'Ultra-Luxury') multiplier = 1.5;
    if (tier === 'Bespoke') multiplier = 2.5;

    let sizeMultiplier = 1;
    if (size === 'Medium') sizeMultiplier = 1.3;
    if (size === 'Large') sizeMultiplier = 1.8;

    const min = base * multiplier * sizeMultiplier;
    const max = min * 1.4;

    setEstimate({ min, max });
    setStep(5);
  };

  return (
    <div className={styles.estimatorCard}>
      {step < 5 && <div className={styles.progress}>Step {step} of 4</div>}
      
      {step === 1 && (
        <div className={styles.stepContent}>
          <h2 className={styles.stepTitle}>What type of project are you planning?</h2>
          <div className={styles.optionsGrid}>
            {['Kitchen', 'Primary Bathroom', 'Whole Home', 'Pool & Exterior'].map(type => (
              <button 
                key={type}
                className={`${styles.optionBtn} ${projectType === type ? styles.selected : ''}`}
                onClick={() => { setProjectType(type); handleNext(); }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className={styles.stepContent}>
          <h2 className={styles.stepTitle}>Select your desired finish level</h2>
          <div className={styles.optionsGrid}>
            {[
              { id: 'Premium', desc: 'High-end materials, semi-custom cabinetry' },
              { id: 'Ultra-Luxury', desc: 'Fully custom, imported materials, smart home integration' },
              { id: 'Bespoke', desc: 'One-of-a-kind architectural details, rarest materials globally' }
            ].map(t => (
              <button 
                key={t.id}
                className={`${styles.optionBtn} ${tier === t.id ? styles.selected : ''}`}
                onClick={() => { setTier(t.id); handleNext(); }}
              >
                <strong>{t.id}</strong>
                <span className={styles.optionDesc}>{t.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className={styles.stepContent}>
          <h2 className={styles.stepTitle}>What is the approximate scale?</h2>
          <div className={styles.optionsGrid}>
            {['Small', 'Medium', 'Large'].map(s => (
              <button 
                key={s}
                className={`${styles.optionBtn} ${size === s ? styles.selected : ''}`}
                onClick={() => { setSize(s); handleNext(); }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className={styles.stepContent}>
          <h2 className={styles.stepTitle}>Unlock Your Blueprint Estimate</h2>
          <p className={styles.stepSubtitle}>Enter your details to see your calculated cost and view top LuxeCertified™ contractors in your area.</p>
          <form onSubmit={calculateEstimate} className={styles.leadForm}>
            <input required type="text" placeholder="Full Name" className={styles.input} />
            <input required type="email" placeholder="Email Address" className={styles.input} />
            <input required type="tel" placeholder="Phone Number" className={styles.input} />
            <button type="submit" className={styles.submitBtn}>Reveal Estimate</button>
          </form>
        </div>
      )}

      {step === 5 && estimate && (
        <div className={styles.resultContent}>
          <h2 className={styles.stepTitle}>Your Blueprint Estimate</h2>
          <div className={styles.estimateBox}>
            <span className={styles.estimateValue}>
              ${estimate.min.toLocaleString(undefined, {maximumFractionDigits: 0})} - ${estimate.max.toLocaleString(undefined, {maximumFractionDigits: 0})}
            </span>
            <p className={styles.estimateDisclaimer}>*This is a preliminary estimate. A LuxeCertified™ contractor will provide a final bid.</p>
          </div>
          <button className={styles.submitBtn}>View Matched Contractors</button>
        </div>
      )}
    </div>
  );
}
