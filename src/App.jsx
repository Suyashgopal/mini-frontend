import React, { useState, useEffect, useRef } from 'react';
import { uploadFile, validateText } from './services/api.service';

/**
 * @typedef {Object} ExtractedData
 * @property {string} extracted_text - The OCR extracted text
 * @property {string} processing_time - Processing time in seconds
 * @property {string} model_name - OCR model used
 * @property {number} [pages_processed] - Number of pages processed (PDF only)
 */

/**
 * @typedef {Object} ValidationResult
 * @property {string} drug_name - Extracted drug name
 * @property {string} strength - Drug strength
 * @property {string} batch_number - Batch number
 * @property {string} expiry_date - Expiry date
 * @property {string} manufacturer - Manufacturer name
 * @property {string} risk_level - Risk level (LOW/MEDIUM/HIGH)
 * @property {number} confidence_score - Confidence score (0-100)
 * @property {string[]} missing_fields - List of missing fields
 */

function HomePage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isApiOnline, setIsApiOnline] = useState(false);
  const [lastExtractionTime, setLastExtractionTime] = useState('');
  const [dragOver, setDragOver] = useState(false);
  
  const fileInputRef = useRef(null);
  const progressTimerRef = useRef(null);
  const healthTimerRef = useRef(null);

  // Progress estimation config
  const PROGRESS_ESTIMATES = {
    image: 12, // seconds
    pdf: 30 // seconds per page
  };

  // Initialize theme and health check
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setIsDarkMode(savedTheme !== 'light');
    
    // Start health check polling
    checkApiHealth();
    healthTimerRef.current = setInterval(checkApiHealth, 10000);
    
    return () => {
      if (healthTimerRef.current) {
        clearInterval(healthTimerRef.current);
      }
    };
  }, []);

  // Check API health
  const checkApiHealth = async () => {
    try {
      const response = await fetch('http://localhost:5000/health');
      setIsApiOnline(response.ok);
    } catch {
      setIsApiOnline(false);
    }
  };

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setExtractedData(null);
    setValidationResult(null);
    setProgress(0);
    setProgressStatus('');
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file && isValidFileType(file)) {
      handleFileSelect(file);
    }
  };

  // Validate file type
  const isValidFileType = (file) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/bmp', 'image/tiff', 'application/pdf'];
    return validTypes.includes(file.type);
  };

  // Start progress tracking
  const startProgress = (file) => {
    const isPdf = file.type === 'application/pdf';
    const estimatedTime = isPdf ? PROGRESS_ESTIMATES.pdf : PROGRESS_ESTIMATES.image;
    
    setProgressStatus('Extracting...');
    
    let elapsed = 0;
    const interval = 100; // Update every 100ms
    
    progressTimerRef.current = setInterval(() => {
      elapsed += interval;
      const progress = Math.min((elapsed / (estimatedTime * 1000)) * 100, 95);
      setProgress(progress);
      
      const remaining = Math.max(estimatedTime - Math.floor(elapsed / 1000), 0);
      
      // Hold at 95% with pulsing animation if taking longer than estimated
      if (progress >= 95) {
        setProgressStatus('Extracting... ~' + remaining + 's remaining');
        // Add pulsing class to progress bar
        const progressBar = document.querySelector('.progress-fill');
        if (progressBar) {
          progressBar.classList.add('pulsing');
        }
      }
    }, interval);
  };

  // Stop progress tracking
  const stopProgress = (success) => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }
    
    setProgress(100);
    
    if (success) {
      setProgressStatus('✓ Extraction complete');
      setLastExtractionTime(new Date().toLocaleTimeString());
    } else {
      setProgressStatus('Extraction failed');
      // Turn progress bar red
      const progressBar = document.querySelector('.progress-fill');
      if (progressBar) {
        progressBar.style.backgroundColor = 'var(--accent-red)';
      }
    }
    
    // Hide progress bar after 1.5 seconds
    setTimeout(() => {
      setProgress(0);
      setProgressStatus('');
      const progressBar = document.querySelector('.progress-fill');
      if (progressBar) {
        progressBar.classList.remove('pulsing');
        progressBar.style.backgroundColor = '';
      }
    }, 1500);
  };

  // Handle file extraction
  const handleExtract = async () => {
    if (!selectedFile) return;
    
    setIsExtracting(true);
    startProgress(selectedFile);
    
    try {
      const response = await uploadFile(selectedFile);
      
      if (response.success === false) {
        throw new Error(response.error || 'Extraction failed');
      }
      
      setExtractedData(response.data);
      
      // Automatically run validation after successful extraction
      if (response.data?.extracted_text) {
        try {
          const validationResponse = await validateText(response.data.extracted_text);
          if (validationResponse.success !== false) {
            setValidationResult(validationResponse.data || validationResponse);
          }
        } catch (validationError) {
          console.error('Validation failed:', validationError);
        }
      }
      
      stopProgress(true);
    } catch (error) {
      console.error('Extraction error:', error);
      stopProgress(false);
    } finally {
      setIsExtracting(false);
    }
  };

  // Get risk level badge class
  const getRiskBadgeClass = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low': return 'badge-success';
      case 'medium': return 'badge-warning';
      case 'high': return 'badge-danger';
      default: return 'badge-warning';
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Progress Bar */}
      {progress > 0 && (
        <div className="progress-bar fixed top-0 left-0 right-0 z-50">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-40 p-2 rounded-lg border border-var(--border) hover:border-var(--accent-green) transition-colors"
        style={{ backgroundColor: 'var(--bg-surface)' }}
        aria-label="Toggle theme"
      >
        {isDarkMode ? '🌙' : '☀️'}
      </button>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center grid-bg relative">
        <div className="container text-center">
          {/* Badge */}
          <div className="inline-block px-4 py-2 rounded-full mb-8" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--accent-green)' }}>
            <span style={{ color: 'var(--accent-green)' }} className="text-sm font-semibold">
              Pharmaceutical Grade OCR
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 font-mono">
            Label Verification<br/>
            <span style={{ color: 'var(--accent-green)' }}>·</span> Instant Compliance
          </h1>

          {/* Subtext */}
          <p className="text-xl mb-12 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Upload a pharmaceutical label image or PDF. Our AI extracts and validates every field 
            against verified standards in seconds.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center mb-16">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-primary"
            >
              📷 Upload Image →
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-outline"
            >
              📄 Upload PDF →
            </button>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInputChange}
            accept="image/*,.pdf"
            className="hidden"
          />

          {/* Scroll Indicator */}
          <div className="scroll-indicator" style={{ color: 'var(--text-secondary)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 10l5 5 5-5"/>
            </svg>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20" style={{ backgroundColor: 'var(--bg-surface)' }}>
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
          <div className="flex gap-8 items-center justify-center flex-col md:flex-row">
            {/* Step 1 */}
            <div className="text-center flex-1">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--accent-green)' }}>
                <span className="text-2xl">📤</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Drag & drop or select your label file</p>
            </div>

            {/* Connector */}
            <div className="hidden md:block w-16 border-t-2 border-dashed" style={{ borderColor: 'var(--border)' }}></div>

            {/* Step 2 */}
            <div className="text-center flex-1">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--accent-green)' }}>
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Extract</h3>
              <p style={{ color: 'var(--text-secondary)' }}>AI extracts text with high accuracy</p>
            </div>

            {/* Connector */}
            <div className="hidden md:block w-16 border-t-2 border-dashed" style={{ borderColor: 'var(--border)' }}></div>

            {/* Step 3 */}
            <div className="text-center flex-1">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--accent-green)' }}>
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Validate</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Compliance check against standards</p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Upload Panel */}
      <section className="py-20" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-16">Try It Now</h2>
          
          <div className="flex gap-8 flex-col lg:flex-row">
            {/* Left - Drop Zone */}
            <div className="flex-1">
              <div
                className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">📁</div>
                  <h3 className="text-xl font-semibold mb-2">
                    {selectedFile ? 'File Selected' : 'Drop your file here'}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)' }} className="mb-4">
                    {selectedFile 
                      ? `${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`
                      : 'PNG, JPG, JPEG, BMP, TIFF, PDF'
                    }
                  </p>
                  <button
                    onClick={handleExtract}
                    disabled={!selectedFile || isExtracting}
                    className="btn btn-primary"
                  >
                    {isExtracting ? 'Processing...' : 'Extract Text'}
                  </button>
                </div>
              </div>
            </div>

            {/* Right - Results Panel */}
            <div className="flex-1">
              <div className="card">
                <h3 className="text-xl font-semibold mb-4">Results</h3>
                
                {/* Progress Status */}
                {progressStatus && (
                  <div className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                    {progressStatus}
                  </div>
                )}

                {/* Extracted Text */}
                {extractedData?.extracted_text ? (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2">Extracted Text</h4>
                    <div className="p-4 rounded-lg font-mono text-sm max-h-48 overflow-y-auto" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                      {extractedData.extracted_text}
                    </div>
                    <div className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                      Model: {extractedData.model_name} • Time: {extractedData.processing_time}s
                      {extractedData.pages_processed && ` • Pages: ${extractedData.pages_processed}`}
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 text-center py-8" style={{ color: 'var(--text-muted)' }}>
                    <div className="text-2xl mb-2">📋</div>
                    <p>Upload a file to see extracted text</p>
                  </div>
                )}

                {/* Validation Result */}
                {validationResult ? (
                  <div>
                    <h4 className="font-semibold mb-2">Validation Result</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Risk Level:</span>
                        <span className={`badge ${getRiskBadgeClass(validationResult.risk_level)}`}>
                          {validationResult.risk_level}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Confidence:</span>
                        <span>{validationResult.confidence_score}%</span>
                      </div>
                      {validationResult.drug_name && (
                        <div className="flex justify-between">
                          <span>Drug Name:</span>
                          <span>{validationResult.drug_name}</span>
                        </div>
                      )}
                      {validationResult.strength && (
                        <div className="flex justify-between">
                          <span>Strength:</span>
                          <span>{validationResult.strength}</span>
                        </div>
                      )}
                      {validationResult.missing_fields?.length > 0 && (
                        <div>
                          <span className="font-semibold">Missing Fields:</span>
                          <div className="mt-1">
                            {validationResult.missing_fields.map((field, index) => (
                              <span key={index} className="badge badge-warning mr-2">
                                {field}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : extractedData && (
                  <div className="text-center py-4" style={{ color: 'var(--text-muted)' }}>
                    <p>Validation in progress...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-10 flex items-center justify-between px-4 text-sm" style={{ backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center">
          <span className={`health-dot ${isApiOnline ? 'health-online' : 'health-offline'}`}></span>
          <span style={{ color: 'var(--text-secondary)' }}>API</span>
        </div>
        <div style={{ color: 'var(--text-secondary)' }}>
          {lastExtractionTime ? `Last: ${lastExtractionTime}` : 'No extractions yet'}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
