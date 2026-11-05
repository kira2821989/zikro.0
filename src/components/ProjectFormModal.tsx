import React, { useState } from 'react';
import { X, Upload, Film, Image as ImageIcon, Sparkles, Shield, DollarSign, User, Phone, Check } from 'lucide-react';
import { Project, MediaType, AspectRatio, WatermarkSpeed, WatermarkStyle } from '../types';
import { playClickPop } from '../utils/audio';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project) => void;
  initialProject?: Project | null;
}

const PRESET_VIDEOS = [
  { label: '🔥 9:16 Fitness / Action Reel (15s)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', aspect: '9:16' as AspectRatio },
  { label: '📱 9:16 Tech / Shorts Sample (15s)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', aspect: '9:16' as AspectRatio },
  { label: '🎬 16:9 Cinematic Landscape Vlog (47s)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4', aspect: '16:9' as AspectRatio },
];

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProject
}) => {
  const [title, setTitle] = useState(initialProject?.title || '');
  const [type, setType] = useState<MediaType>(initialProject?.type || 'video');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(initialProject?.aspectRatio || '9:16');
  const [clientName, setClientName] = useState(initialProject?.clientName || '');
  const [clientPhone, setClientPhone] = useState(initialProject?.clientPhone || '');
  const [amountINR, setAmountINR] = useState<number>(initialProject?.amountINR || 1500);
  const [upiId, setUpiId] = useState(initialProject?.upiId || localStorage.getItem('editlock_saved_upi') || 'editor@okhdfcbank');
  const [upiPayeeName, setUpiPayeeName] = useState(initialProject?.upiPayeeName || localStorage.getItem('editlock_saved_name') || 'Vikram Singh');
  const [mediaUrl, setMediaUrl] = useState(initialProject?.mediaUrl || PRESET_VIDEOS[0].url);
  const [localFileName, setLocalFileName] = useState('');
  
  // Watermark Settings
  const [watermarkText, setWatermarkText] = useState(initialProject?.watermarkSettings?.text || 'DRAFT PREVIEW • PAYMENT PENDING • EDITLOCK');
  const [watermarkSpeed, setWatermarkSpeed] = useState<WatermarkSpeed>(initialProject?.watermarkSettings?.speed || 'medium');
  const [watermarkStyle, setWatermarkStyle] = useState<WatermarkStyle>(initialProject?.watermarkSettings?.style || 'diagonal-floating');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(initialProject?.watermarkSettings?.opacity || 0.65);
  const [showTimecode, setShowTimecode] = useState(initialProject?.watermarkSettings?.showTimecode ?? true);
  const [showClientTag, setShowClientTag] = useState(initialProject?.watermarkSettings?.showClientTag ?? true);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      setMediaUrl(blobUrl);
      setLocalFileName(file.name);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
      playClickPop();
    }
  };

  const handleSelectPreset = (preset: typeof PRESET_VIDEOS[0]) => {
    setMediaUrl(preset.url);
    setAspectRatio(preset.aspect);
    setLocalFileName('');
    playClickPop();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !clientName.trim() || !mediaUrl.trim()) return;

    // Save default editor credentials for future projects
    localStorage.setItem('editlock_saved_upi', upiId);
    localStorage.setItem('editlock_saved_name', upiPayeeName);

    const savedProject: Project = {
      id: initialProject?.id || `proj-${Date.now().toString(36)}`,
      title: title.trim(),
      type,
      aspectRatio,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim() || undefined,
      amountINR: Number(amountINR) || 1000,
      upiId: upiId.trim(),
      upiPayeeName: upiPayeeName.trim(),
      mediaUrl: mediaUrl.trim(),
      status: initialProject?.status || 'in_review',
      createdAt: initialProject?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: initialProject?.comments || [],
      paymentDetails: initialProject?.paymentDetails,
      watermarkSettings: {
        text: watermarkText.trim() || 'DRAFT PREVIEW • PAYMENT PENDING',
        opacity: watermarkOpacity,
        speed: watermarkSpeed,
        style: watermarkStyle,
        showClientTag,
        showTimecode,
        fontSize: 'medium'
      }
    };

    onSave(savedProject);
    playClickPop();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 bg-neutral-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-neutral-950 font-bold shadow-md">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {initialProject ? 'Edit Review Project' : 'Create New Client Review'}
              </h3>
              <p className="text-xs text-neutral-400">Lock your video preview with anti-theft dynamic watermark & UPI unlock</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1.5 text-neutral-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {/* Project Title & Media Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">Project / Video Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Viral Gym Reel (Before vs After) v1"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Type & Aspect Ratio */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-neutral-300 mb-1 block">Content Format</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('video')}
                  className={`p-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 border transition ${
                    type === 'video' ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold' : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('thumbnail')}
                  className={`p-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 border transition ${
                    type === 'thumbnail' ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold' : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Thumbnail</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 mb-1 block">Aspect Ratio</label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                className="w-full bg-neutral-950 border border-neutral-700 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500"
              >
                <option value="9:16">9:16 (Instagram Reel / YT Shorts / TikTok)</option>
                <option value="16:9">16:9 (YouTube Video / Landscape)</option>
                <option value="1:1">1:1 (Square Post / Feed)</option>
              </select>
            </div>
          </div>

          {/* Media Upload or URL Source */}
          <div className="space-y-2 p-3 bg-neutral-950 rounded-2xl border border-neutral-800">
            <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
              <span>Video / File Source</span>
              {localFileName && <span className="text-[10px] text-emerald-400 font-mono">Uploaded: {localFileName}</span>}
            </label>

            {/* Direct File Picker (Mobile Phone friendly) */}
            <div className="flex gap-2 items-center">
              <label className="flex-1 cursor-pointer bg-neutral-900 hover:bg-neutral-800 border border-dashed border-neutral-700 hover:border-amber-500/60 p-3 rounded-xl flex items-center justify-center gap-2 text-xs text-neutral-300 transition">
                <Upload className="w-4 h-4 text-amber-400" />
                <span>Upload from Phone / PC (MP4, MOV, PNG)</span>
                <input 
                  type="file" 
                  accept="video/*,image/*" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
              </label>
            </div>

            {/* Or Paste Direct URL */}
            <div className="pt-1">
              <input
                type="text"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="Or paste direct video/image URL (R2, Render, Google Drive, S3)"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-[11px] text-neutral-300 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-[10px]">
              <span className="text-neutral-500 font-mono uppercase">Presets:</span>
              {PRESET_VIDEOS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="shrink-0 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-amber-300 px-2 py-0.5 rounded border border-neutral-800 transition"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Client Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-neutral-400" />
                <span>Client Name *</span>
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Rohit Verma"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-neutral-400" />
                <span>Client WhatsApp / Phone</span>
              </label>
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Amount & Editor UPI Settings */}
          <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-3">
            <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span>Payment & UPI Details (Zero Fee)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Fee in INR (₹) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-neutral-500 font-mono">₹</span>
                  <input
                    type="number"
                    required
                    min={1}
                    value={amountINR}
                    onChange={(e) => setAmountINR(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-700 text-amber-300 font-mono font-bold text-xs rounded-xl pl-6 pr-3 py-2 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Your UPI ID *</label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. yourname@okhdfcbank"
                  className="w-full bg-neutral-900 border border-neutral-700 text-white font-mono text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">UPI Payee Name *</label>
                <input
                  type="text"
                  required
                  value={upiPayeeName}
                  onChange={(e) => setUpiPayeeName(e.target.value)}
                  placeholder="e.g. Vikram Singh"
                  className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Watermark Customization Accordion */}
          <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-2.5">
            <div className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Anti-Theft Watermark Settings</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">AUTO REMOVED ON PAYMENT</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Watermark Banner Text</label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="DRAFT PREVIEW • PAYMENT PENDING"
                  className="w-full bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-500 uppercase font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Movement Style</label>
                <select
                  value={watermarkSpeed}
                  onChange={(e) => setWatermarkSpeed(e.target.value as WatermarkSpeed)}
                  className="w-full bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-500"
                >
                  <option value="bouncing">DVD Bouncing Physics (Anti-AI Mask)</option>
                  <option value="medium">Continuous Floating Drift</option>
                  <option value="fast">Fast Jitter Drift</option>
                  <option value="slow">Gentle Float</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-300 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTimecode}
                  onChange={(e) => setShowTimecode(e.target.checked)}
                  className="accent-amber-500 rounded"
                />
                <span className="text-[11px]">Show Live Video Timecode (Stops auto-cropping)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showClientTag}
                  onChange={(e) => setShowClientTag(e.target.checked)}
                  className="accent-amber-500 rounded"
                />
                <span className="text-[11px]">Show Client Name on screen</span>
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-2 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold rounded-xl text-xs transition shadow-lg shadow-amber-500/20"
            >
              {initialProject ? 'Save Changes' : 'Create & Generate Client Review Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
