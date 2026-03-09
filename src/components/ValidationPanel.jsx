import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function ValidationPanel({ validationResult, extractedData }) {
  // Helper function to get risk badge class
  const getRiskBadgeClass = (riskLevel) => {
    if (!riskLevel) return 'badge-warning';
    const level = riskLevel.toLowerCase();
    if (level === 'low') return 'badge-success';
    if (level === 'medium') return 'badge-warning';
    if (level === 'high') return 'badge-danger';
    return 'badge-warning';
  };

  // Check if verified
  const isVerified = validationResult &&
    validationResult.risk_level?.toLowerCase() !== 'high' &&
    (validationResult.confidence_score ?? 0) >= 70;

  // Don't render if no extracted data
  if (!extractedData) {
    return null;
  }

  // State A: Validating
  if (!validationResult) {
    return (
      <div className="vl-card" style={{ padding: '32px' }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: 700, 
          color: 'var(--vl-blue)', 
          marginBottom: '24px' 
        }}>
          Running Validation...
        </h2>
        
        {/* Progress bar */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            height: '6px',
            borderRadius: '999px',
            background: 'var(--vl-border)',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{
              height: '100%',
              width: '60%',
              background: 'var(--vl-gradient)',
              borderRadius: '999px',
              animation: 'pulse 2s infinite',
              boxShadow: '0 0 8px rgba(0,200,150,0.4)'
            }} />
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          fontSize: '14px', 
          color: 'var(--vl-text)' 
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'var(--vl-green)',
            animation: 'pulse 2s infinite'
          }} />
          Checking against encrypted hash system...
        </div>
      </div>
    );
  }

  // State B: VERIFIED
  if (isVerified) {
    return (
      <div className="vl-card" style={{ padding: '0', overflow: 'hidden' }}>
        {/* Success banner */}
        <div style={{
          background: 'var(--vl-success-bg)',
          borderLeft: '4px solid var(--vl-success)',
          padding: '24px 32px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <CheckCircle size={32} style={{ color: 'var(--vl-success)' }} />
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--vl-success)',
              margin: '0 0 4px 0'
            }}>
              VERIFIED THROUGH OUR ENCRYPTED HASH SYSTEM
            </h3>
            <p style={{
              fontSize: '14px',
              color: 'var(--vl-success)',
              margin: 0,
              opacity: 0.9
            }}>
              This document has been authenticated and validated successfully.
            </p>
          </div>
        </div>

        {/* Fields grid */}
        <div style={{ padding: '32px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '24px'
          }}>
            {/* Drug Name */}
            <div className="vl-card" style={{ padding: '16px' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--vl-muted)',
                textTransform: 'uppercase',
                marginBottom: '8px'
              }}>
                Drug Name
              </div>
              <div style={{
                fontSize: '15px',
                fontWeight: 700,
                color: 'var(--vl-text)'
              }}>
                {validationResult.extracted_fields?.drug_name || 'Not detected'}
              </div>
            </div>

            {/* Strength */}
            <div className="vl-card" style={{ padding: '16px' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--vl-muted)',
                textTransform: 'uppercase',
                marginBottom: '8px'
              }}>
                Strength
              </div>
              <div style={{
                fontSize: '15px',
                fontWeight: 700,
                color: 'var(--vl-text)'
              }}>
                {validationResult.extracted_fields?.strength || 'Not detected'}
              </div>
            </div>

            {/* Batch Number */}
            <div className="vl-card" style={{ padding: '16px' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--vl-muted)',
                textTransform: 'uppercase',
                marginBottom: '8px'
              }}>
                Batch Number
              </div>
              <div style={{
                fontSize: '15px',
                fontWeight: 700,
                color: 'var(--vl-text)'
              }}>
                {validationResult.extracted_fields?.batch_number || 'Not detected'}
              </div>
            </div>

            {/* Expiry Date */}
            <div className="vl-card" style={{ padding: '16px' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--vl-muted)',
                textTransform: 'uppercase',
                marginBottom: '8px'
              }}>
                Expiry Date
              </div>
              <div style={{
                fontSize: '15px',
                fontWeight: 700,
                color: 'var(--vl-text)'
              }}>
                {validationResult.extracted_fields?.expiry_date || 'Not detected'}
              </div>
            </div>

            {/* Manufacturer */}
            <div className="vl-card" style={{ padding: '16px' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--vl-muted)',
                textTransform: 'uppercase',
                marginBottom: '8px'
              }}>
                Manufacturer
              </div>
              <div style={{
                fontSize: '15px',
                fontWeight: 700,
                color: 'var(--vl-text)'
              }}>
                {validationResult.extracted_fields?.manufacturer || 'Not detected'}
              </div>
            </div>

            {/* License Number */}
            <div className="vl-card" style={{ padding: '16px' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--vl-muted)',
                textTransform: 'uppercase',
                marginBottom: '8px'
              }}>
                License Number
              </div>
              <div style={{
                fontSize: '15px',
                fontWeight: 700,
                color: 'var(--vl-text)'
              }}>
                {validationResult.extracted_fields?.license_number || 'Not detected'}
              </div>
            </div>

            {/* Risk Level */}
            <div className="vl-card" style={{ padding: '16px' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--vl-muted)',
                textTransform: 'uppercase',
                marginBottom: '8px'
              }}>
                Risk Level
              </div>
              <div className={getRiskBadgeClass(validationResult.risk_level)} style={{
                fontSize: '12px',
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '20px',
                fontWeight: 600,
                textTransform: 'uppercase'
              }}>
                {validationResult.risk_level || 'Unknown'}
              </div>
            </div>

            {/* Confidence Score */}
            <div className="vl-card" style={{ padding: '16px' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--vl-muted)',
                textTransform: 'uppercase',
                marginBottom: '8px'
              }}>
                Confidence Score
              </div>
              <div style={{
                fontSize: '15px',
                fontWeight: 700,
                color: 'var(--vl-text)'
              }}>
                {validationResult.confidence_score || 0}%
              </div>
            </div>
          </div>

          {/* Analysis summary */}
          {validationResult.analysis_summary && (
            <div style={{
              fontSize: '14px',
              color: 'var(--vl-muted)',
              fontStyle: 'italic',
              textAlign: 'center',
              padding: '16px',
              background: 'var(--vl-bg)',
              borderRadius: '8px'
            }}>
              {validationResult.analysis_summary}
            </div>
          )}
        </div>
      </div>
    );
  }

  // State C: NOT VERIFIED
  return (
    <div className="vl-card" style={{ padding: '0', overflow: 'hidden' }}>
      {/* Danger banner */}
      <div style={{
        background: 'var(--vl-danger-bg)',
        borderLeft: '4px solid var(--vl-danger)',
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <XCircle size={32} style={{ color: 'var(--vl-danger)' }} />
        <div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--vl-danger)',
            margin: '0 0 4px 0'
          }}>
            Document could not be verified
          </h3>
          <p style={{
            fontSize: '14px',
            color: 'var(--vl-danger)',
            margin: 0,
            opacity: 0.9
          }}>
            Please check authenticity or re-upload.
          </p>
        </div>
      </div>

      {/* Fields grid with red tint */}
      <div style={{ padding: '32px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}>
          {/* Same field grid as above but with red tint */}
          <div className="vl-card" style={{ 
            padding: '16px',
            borderLeft: '3px solid var(--vl-danger)'
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--vl-muted)',
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}>
              Drug Name
            </div>
            <div style={{
              fontSize: '15px',
              fontWeight: 700,
              color: 'var(--vl-text)'
            }}>
              {validationResult.extracted_fields?.drug_name || 'Not detected'}
            </div>
          </div>

          {/* Add other fields similarly with red tint */}
          <div className="vl-card" style={{ 
            padding: '16px',
            borderLeft: '3px solid var(--vl-danger)'
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--vl-muted)',
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}>
              Risk Level
            </div>
            <div className={getRiskBadgeClass(validationResult.risk_level)} style={{
              fontSize: '12px',
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '20px',
              fontWeight: 600,
              textTransform: 'uppercase'
            }}>
              {validationResult.risk_level || 'Unknown'}
            </div>
          </div>

          <div className="vl-card" style={{ 
            padding: '16px',
            borderLeft: '3px solid var(--vl-danger)'
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--vl-muted)',
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}>
              Confidence Score
            </div>
            <div style={{
              fontSize: '15px',
              fontWeight: 700,
              color: 'var(--vl-danger)'
            }}>
              {validationResult.confidence_score || 0}%
            </div>
          </div>
        </div>

        {/* Analysis summary */}
        {validationResult.analysis_summary && (
          <div style={{
            fontSize: '14px',
            color: 'var(--vl-muted)',
            fontStyle: 'italic',
            textAlign: 'center',
            padding: '16px',
            background: 'var(--vl-danger-bg)',
            borderRadius: '8px'
          }}>
            {validationResult.analysis_summary}
          </div>
        )}
      </div>
    </div>
  );
}
