
import React, { useState, useRef, useCallback, useEffect } from 'react';
import Header from './components/Header';
import LandmarkOverlay from './components/LandmarkOverlay';
import { analyzeFaceShape, generateInspirationImage } from './services/geminiService';
import { AppState, AnalysisResult } from './types';
import { FACE_SHAPE_INFO } from './constants';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    image: null,
    isAnalyzing: false,
    result: null,
    error: null,
  });

  const [inputMode, setInputMode] = useState<'upload' | 'camera'>('upload');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setIsCameraLoading(false);
  }, []);

  const startCamera = async () => {
    setIsCameraLoading(true);
    setInputMode('camera');
    setState(prev => ({ ...prev, image: null, result: null, error: null }));
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user', 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      streamRef.current = stream;
      setIsCameraActive(true);
      setIsCameraLoading(false);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 50);

    } catch (err) {
      console.error("Camera access error:", err);
      setIsCameraLoading(false);
      setIsCameraActive(false);
      setInputMode('upload');
      setState(prev => ({ ...prev, error: "Could not access camera. Please check permissions and ensure you're on HTTPS." }));
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setState(prev => ({ ...prev, image: dataUrl, result: null }));
        stopCamera();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setState(prev => ({ 
          ...prev, 
          image: reader.result as string, 
          result: null, 
          error: null 
        }));
        setInputMode('upload');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!state.image) return;

    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));
    try {
      // Step 1: Analyze Face Shape
      const analysisResult = await analyzeFaceShape(state.image);
      
      setState(prev => ({ 
        ...prev, 
        isAnalyzing: false, 
        result: analysisResult 
      }));

      // Step 2: Generate Inspiration Image (Async)
      setIsImageGenerating(true);
      try {
        const inspirationImg = await generateInspirationImage(analysisResult.shape, analysisResult.tips);
        setState(prev => ({
          ...prev,
          result: prev.result ? { ...prev.result, inspirationImage: inspirationImg } : null
        }));
      } catch (imgErr) {
        console.warn("Could not generate inspiration image:", imgErr);
      } finally {
        setIsImageGenerating(false);
      }

    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        isAnalyzing: false, 
        error: err.message || "Something went wrong during analysis." 
      }));
    }
  };

  const reset = () => {
    stopCamera();
    setState({
      image: null,
      isAnalyzing: false,
      result: null,
      error: null,
    });
    setInputMode('upload');
    setIsImageGenerating(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Discover Your Face Shape</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            VisageAI uses computer vision to map your features and find your perfect style match.
          </p>
        </div>

        {/* Input Method Toggle */}
        {!state.result && !state.isAnalyzing && !state.image && !isCameraActive && !isCameraLoading && (
          <div className="flex justify-center gap-4 mb-8">
            <button 
              onClick={() => setInputMode('upload')}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all ${inputMode === 'upload' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload Photo
            </button>
            <button 
              onClick={startCamera}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all ${inputMode === 'camera' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
              Use Camera
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* LEFT COLUMN: Camera/Upload & Preview */}
          <div className="space-y-6">
            <div className="relative aspect-[3/4] bg-white rounded-3xl shadow-2xl overflow-hidden border-8 border-white group transition-all duration-300">
              
              {isCameraLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 z-10">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-500 font-medium">Requesting camera access...</p>
                </div>
              )}

              {isCameraActive && (
                <div className="relative w-full h-full bg-black">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover scale-x-[-1]" 
                  />
                  <div className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-4">
                    <button 
                      onClick={capturePhoto}
                      className="w-20 h-20 bg-white rounded-full border-8 border-white/30 flex items-center justify-center shadow-2xl active:scale-90 transition-transform hover:scale-105"
                    >
                      <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center">
                         <div className="w-6 h-6 border-2 border-white rounded-full opacity-50"></div>
                      </div>
                    </button>
                    <button 
                      onClick={stopCamera}
                      className="px-4 py-2 bg-black/40 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-black/60 backdrop-blur-md transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-64 h-80 border-2 border-dashed border-white/30 rounded-[120px]"></div>
                  </div>
                </div>
              )}

              {!isCameraActive && !isCameraLoading && state.image && (
                <>
                  <img 
                    src={state.image} 
                    alt="Ready for analysis" 
                    className={`w-full h-full object-cover transition-all duration-500 ${state.isAnalyzing ? 'scale-105 blur-sm opacity-50' : 'scale-100'}`} 
                  />
                  {state.result && <LandmarkOverlay landmarks={state.result.landmarks} />}
                  {state.isAnalyzing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="relative">
                        <div className="w-24 h-24 border-4 border-blue-600/20 rounded-full"></div>
                        <div className="absolute top-0 w-24 h-24 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <p className="mt-6 text-slate-800 font-bold bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm">AI Analysis in progress...</p>
                    </div>
                  )}
                </>
              )}

              {!isCameraActive && !isCameraLoading && !state.image && (
                <div 
                  className="w-full h-full flex flex-col items-center justify-center bg-slate-50 border-4 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 hover:border-blue-200 transition-all group"
                  onClick={() => inputMode === 'upload' ? fileInputRef.current?.click() : startCamera()}
                >
                  <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    {inputMode === 'upload' ? (
                      <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    ) : (
                      <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      </svg>
                    )}
                  </div>
                  <h4 className="text-xl font-bold text-slate-800">
                    {inputMode === 'upload' ? 'Upload a Photo' : 'Prepare Camera'}
                  </h4>
                  <p className="text-slate-500 mt-2 px-8 text-center text-sm leading-relaxed">
                    {inputMode === 'upload' 
                      ? 'Choose a high-quality front-facing photo from your gallery.' 
                      : 'Position yourself in a well-lit area for the best results.'}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              {state.image && !state.result && (
                <>
                  <button
                    disabled={state.isAnalyzing}
                    onClick={handleAnalyze}
                    className="flex-1 py-4 px-6 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 disabled:bg-slate-300 disabled:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                  >
                    {state.isAnalyzing ? 'Processing...' : (
                      <>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Analyze Now
                      </>
                    )}
                  </button>
                  <button
                    disabled={state.isAnalyzing}
                    onClick={reset}
                    className="px-8 py-4 bg-white text-slate-700 border-2 border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                  >
                    Clear
                  </button>
                </>
              )}
              
              {state.result && (
                <button
                  onClick={reset}
                  className="flex-1 py-4 px-6 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-[0.98]"
                >
                  Analyze New Face
                </button>
              )}
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept="image/*" 
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {state.error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium flex items-start gap-3 animate-bounce">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {state.error}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Results & Tips */}
          <div className="space-y-8">
            {!state.result && !state.isAnalyzing && (
              <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Awaiting Scan</h3>
                <p className="text-slate-500 leading-relaxed mb-8">Once your face is analyzed, we'll provide detailed measurements and style recommendations.</p>
                
                <div className="grid grid-cols-1 gap-4 w-full">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-blue-600 shadow-sm">1</div>
                    <div className="text-sm">
                       <p className="font-bold text-slate-700">Landmark Detection</p>
                       <p className="text-slate-500">Mapping 50+ facial points</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-blue-600 shadow-sm">2</div>
                    <div className="text-sm">
                       <p className="font-bold text-slate-700">Shape Classification</p>
                       <p className="text-slate-500">Comparing geometry ratios</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-blue-600 shadow-sm">3</div>
                    <div className="text-sm">
                       <p className="font-bold text-slate-700">Style Curation</p>
                       <p className="text-slate-500">AI-powered grooming tips</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {state.result && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-6">
                <div className="bg-white p-10 rounded-3xl shadow-lg border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-16 -mt-16 opacity-50"></div>
                  
                  <div className="flex items-center justify-between mb-6 relative">
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full">Analysis Complete</span>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                       <span className="text-xs font-medium text-slate-400">{(state.result.confidence * 100).toFixed(0)}% Accuracy</span>
                    </div>
                  </div>
                  
                  <h3 className="text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">{state.result.shape}</h3>
                  <div className="p-5 bg-slate-50 rounded-2xl border-l-4 border-blue-600">
                    <p className="text-slate-700 leading-relaxed font-medium">
                      {state.result.description}
                    </p>
                  </div>
                </div>

                {/* Style Inspiration Visual */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Style Inspiration
                    </h4>
                    {isImageGenerating && (
                      <span className="text-xs font-medium text-blue-600 animate-pulse flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-ping"></div>
                        Generating vision...
                      </span>
                    )}
                  </div>
                  
                  <div className="relative aspect-[3/4] bg-slate-50 rounded-2xl overflow-hidden shadow-inner">
                    {state.result.inspirationImage ? (
                      <img 
                        src={state.result.inspirationImage} 
                        alt="Style Inspiration" 
                        className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-1000"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mb-3 animate-bounce">
                           <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                           </svg>
                        </div>
                        <p className="text-slate-400 text-sm italic">AI is painting a custom style vision based on your unique features...</p>
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-[10px] uppercase tracking-widest text-slate-400 text-center font-bold">Generated AI Style Guide</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <ResultRow 
                    icon={<svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                    title="Grooming & Hair"
                    content={state.result.tips.hair}
                  />
                  <ResultRow 
                    icon={<svg className="w-6 h-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                    title="Eyewear Styles"
                    content={state.result.tips.glasses}
                  />
                  <ResultRow 
                    icon={<svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}
                    title="Contouring & Makeup"
                    content={state.result.tips.makeup}
                  />
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-3xl text-white shadow-2xl shadow-blue-200">
                  <h4 className="text-xl font-bold mb-3 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Style Theory
                  </h4>
                  <p className="opacity-90 leading-relaxed text-sm">
                    {FACE_SHAPE_INFO[state.result.shape]?.desc || "Your face structure is a unique canvas. These AI-generated insights are designed to highlight your natural balance."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="py-12 px-4 border-t border-slate-200 mt-20">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-slate-400 text-sm font-medium">© 2024 VisageAI. Secure processing with Gemini 3 Flash. No photos are stored permanently.</p>
        </div>
      </footer>
    </div>
  );
};

const ResultRow: React.FC<{ icon: React.ReactNode; title: string; content: string }> = ({ icon, title, content }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex gap-5 hover:border-blue-100 transition-all group">
    <div className="flex-shrink-0 w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-blue-50 transition-colors">
      {icon}
    </div>
    <div>
      <h5 className="font-bold text-slate-900 mb-1">{title}</h5>
      <p className="text-slate-500 text-sm leading-relaxed">{content}</p>
    </div>
  </div>
);

export default App;
