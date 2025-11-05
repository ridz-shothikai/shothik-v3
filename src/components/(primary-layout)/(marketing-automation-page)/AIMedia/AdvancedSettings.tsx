interface AdvancedSettingsProps {
  // Avatar settings
  avatarStyle: "circle" | "normal";
  setAvatarStyle: (style: "circle" | "normal") => void;
  avatarScale: number;
  setAvatarScale: (scale: number) => void;
  avatarOffsetX: number;
  setAvatarOffsetX: (offset: number) => void;
  avatarOffsetY: number;
  setAvatarOffsetY: (offset: number) => void;
  avatarHidden: boolean;
  setAvatarHidden: (hidden: boolean) => void;

  // Voice settings
  voiceVolume: number;
  setVoiceVolume: (volume: number) => void;

  // Caption settings
  captionStyle: string;
  setCaptionStyle: (style: string) => void;
  captionOffsetX: number;
  setCaptionOffsetX: (offset: number) => void;
  captionOffsetY: number;
  setCaptionOffsetY: (offset: number) => void;
  fontFamily: string;
  setFontFamily: (family: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  fontStyle: string;
  setFontStyle: (style: string) => void;
  captionBgColor: string;
  setCaptionBgColor: (color: string) => void;
  captionTextColor: string;
  setCaptionTextColor: (color: string) => void;
  captionHighlightColor: string;
  setCaptionHighlightColor: (color: string) => void;
  captionHidden: boolean;
  setCaptionHidden: (hidden: boolean) => void;

  // Background settings
  backgroundType: "image" | "video";
  setBackgroundType: (type: "image" | "video") => void;
  backgroundUrl: string;
  setBackgroundUrl: (url: string) => void;
  backgroundFit: "cover" | "crop" | "contain";
  setBackgroundFit: (fit: "cover" | "crop" | "contain") => void;
  backgroundEffect: string;
  setBackgroundEffect: (effect: string) => void;

  // Transition effects
  transitionIn: string;
  setTransitionIn: (transition: string) => void;
  transitionOut: string;
  setTransitionOut: (transition: string) => void;

  // Visual style
  visualStyle: string;
  setVisualStyle: (style: string) => void;

  // CTA settings
  ctaLogoUrl: string;
  setCtaLogoUrl: (url: string) => void;
  ctaLogoScale: number;
  setCtaLogoScale: (scale: number) => void;
  ctaLogoOffsetX: number;
  setCtaLogoOffsetX: (offset: number) => void;
  ctaLogoOffsetY: number;
  setCtaLogoOffsetY: (offset: number) => void;
  ctaCaption: string;
  setCtaCaption: (caption: string) => void;
  ctaBackgroundBlur: boolean;
  setCtaBackgroundBlur: (blur: boolean) => void;

  // End screen CTA
  endCtaLogoUrl: string;
  setEndCtaLogoUrl: (url: string) => void;
  endCtaCaption: string;
  setEndCtaCaption: (caption: string) => void;
  endCtaDuration: number;
  setEndCtaDuration: (duration: number) => void;
  endCtaBackgroundUrl: string;
  setEndCtaBackgroundUrl: (url: string) => void;

  // Background music
  musicUrl: string;
  setMusicUrl: (url: string) => void;
  musicVolume: number;
  setMusicVolume: (volume: number) => void;

  // Other settings
  videoName: string;
  setVideoName: (name: string) => void;
  modelVersion: "standard" | "aurora_v1" | "aurora_v1_fast";
  setModelVersion: (version: "standard" | "aurora_v1" | "aurora_v1_fast") => void;
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;

  showAdvancedSettings: boolean;
  setShowAdvancedSettings: (show: boolean) => void;
  
  // Asset selector handler
  onOpenAssetSelector?: (field: "background" | "cta-logo" | "end-cta-logo" | "end-cta-background") => void;
}

// Custom Select Component
const CustomSelect = ({ 
  label, 
  value, 
  onChange, 
  options 
}: { 
  label: string; 
  value: string; 
  onChange: (value: string) => void; 
  options: { value: string; label: string }[] 
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-slate-700 border border-slate-600 hover:border-slate-500 rounded-lg px-4 py-2.5 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-slate-800">
            {opt.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </div>
);

export default function AdvancedSettings(props: AdvancedSettingsProps) {
  return (
    <div className="mb-8">
      <button
        onClick={() => props.setShowAdvancedSettings(!props.showAdvancedSettings)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
      >
        <span className="font-semibold">⚙️ Advanced Settings</span>
        <svg
          className={`w-5 h-5 transition-transform ${
            props.showAdvancedSettings ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {props.showAdvancedSettings && (
        <div className="mt-4 p-6 bg-slate-800 rounded-lg space-y-6">
          {/* Avatar Settings */}
          <div>
            <h4 className="font-semibold mb-4 text-blue-400 text-lg">Avatar Settings</h4>
            <div className="grid grid-cols-2 gap-4">
              <CustomSelect
                label="Style"
                value={props.avatarStyle}
                onChange={(value) => props.setAvatarStyle(value as "circle" | "normal")}
                options={[
                  { value: "normal", label: "Normal" },
                  { value: "circle", label: "Circle" }
                ]}
              />
              <div>
                <label className="block text-sm text-gray-400 mb-2">Scale</label>
                <input
                  type="number"
                  value={props.avatarScale}
                  onChange={(e) => props.setAvatarScale(parseFloat(e.target.value))}
                  step="0.1"
                  min="0.1"
                  max="2"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Offset X</label>
                <input
                  type="number"
                  value={props.avatarOffsetX}
                  onChange={(e) => props.setAvatarOffsetX(parseInt(e.target.value))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Offset Y</label>
                <input
                  type="number"
                  value={props.avatarOffsetY}
                  onChange={(e) => props.setAvatarOffsetY(parseInt(e.target.value))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 mt-3">
              <input
                type="checkbox"
                checked={props.avatarHidden}
                onChange={(e) => props.setAvatarHidden(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-400">Hide Avatar</span>
            </label>
          </div>

          {/* Voice Settings */}
          <div>
            <h4 className="font-semibold mb-4 text-blue-400 text-lg">Voice Settings</h4>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Volume (0-1)</label>
              <input
                type="number"
                value={props.voiceVolume}
                onChange={(e) => props.setVoiceVolume(parseFloat(e.target.value))}
                step="0.1"
                min="0"
                max="1"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Caption Settings */}
          <div>
            <h4 className="font-semibold mb-4 text-blue-400 text-lg">Caption Settings</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Caption Style</label>
                <input
                  type="text"
                  value={props.captionStyle}
                  onChange={(e) => props.setCaptionStyle(e.target.value)}
                  placeholder="normal-black"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Font Family</label>
                <input
                  type="text"
                  value={props.fontFamily}
                  onChange={(e) => props.setFontFamily(e.target.value)}
                  placeholder="Montserrat"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Font Size</label>
                <input
                  type="number"
                  value={props.fontSize}
                  onChange={(e) => props.setFontSize(parseInt(e.target.value))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Font Style</label>
                <input
                  type="text"
                  value={props.fontStyle}
                  onChange={(e) => props.setFontStyle(e.target.value)}
                  placeholder="font-bold"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Caption Offset X</label>
                <input
                  type="number"
                  value={props.captionOffsetX}
                  onChange={(e) => props.setCaptionOffsetX(parseFloat(e.target.value))}
                  step="0.1"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Caption Offset Y</label>
                <input
                  type="number"
                  value={props.captionOffsetY}
                  onChange={(e) => props.setCaptionOffsetY(parseFloat(e.target.value))}
                  step="0.1"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Background Color</label>
                <input
                  type="color"
                  value={props.captionBgColor}
                  onChange={(e) => props.setCaptionBgColor(e.target.value)}
                  className="w-full h-10 bg-slate-700 border border-slate-600 rounded-lg px-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Text Color</label>
                <input
                  type="color"
                  value={props.captionTextColor}
                  onChange={(e) => props.setCaptionTextColor(e.target.value)}
                  className="w-full h-10 bg-slate-700 border border-slate-600 rounded-lg px-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Highlight Color</label>
                <input
                  type="color"
                  value={props.captionHighlightColor}
                  onChange={(e) => props.setCaptionHighlightColor(e.target.value)}
                  className="w-full h-10 bg-slate-700 border border-slate-600 rounded-lg px-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 mt-3">
              <input
                type="checkbox"
                checked={props.captionHidden}
                onChange={(e) => props.setCaptionHidden(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-400">Hide Captions</span>
            </label>
          </div>

          {/* Background Settings */}
          <div>
            <h4 className="font-semibold mb-4 text-blue-400 text-lg">Background</h4>
            <div className="grid grid-cols-2 gap-4">
              <CustomSelect
                label="Type"
                value={props.backgroundType}
                onChange={(value) => props.setBackgroundType(value as "image" | "video")}
                options={[
                  { value: "image", label: "Image" },
                  { value: "video", label: "Video" }
                ]}
              />
              <CustomSelect
                label="Fit"
                value={props.backgroundFit}
                onChange={(value) => props.setBackgroundFit(value as "cover" | "crop" | "contain")}
                options={[
                  { value: "cover", label: "Cover" },
                  { value: "crop", label: "Crop" },
                  { value: "contain", label: "Contain" }
                ]}
              />
              <div className="col-span-2">
                <label className="block text-sm text-gray-400 mb-2">Background URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={props.backgroundUrl}
                    onChange={(e) => props.setBackgroundUrl(e.target.value)}
                    placeholder="https://example.com/background.jpg"
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {props.onOpenAssetSelector && (
                    <button
                      onClick={() => props.onOpenAssetSelector?.("background")}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                    >
                      Select
                    </button>
                  )}
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-400 mb-2">Background Effect</label>
                <input
                  type="text"
                  value={props.backgroundEffect}
                  onChange={(e) => props.setBackgroundEffect(e.target.value)}
                  placeholder="imageSlideLeft"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Transition Effects */}
          <div>
            <h4 className="font-semibold mb-4 text-blue-400 text-lg">Transition Effects</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Transition In</label>
                <input
                  type="text"
                  value={props.transitionIn}
                  onChange={(e) => props.setTransitionIn(e.target.value)}
                  placeholder="fade"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Transition Out</label>
                <input
                  type="text"
                  value={props.transitionOut}
                  onChange={(e) => props.setTransitionOut(e.target.value)}
                  placeholder="fade"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Visual Style */}
          <div>
            <h4 className="font-semibold mb-4 text-blue-400 text-lg">Visual Style</h4>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Style Preset</label>
              <input
                type="text"
                value={props.visualStyle}
                onChange={(e) => props.setVisualStyle(e.target.value)}
                placeholder="FullAvatar"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* CTA Settings */}
          <div>
            <h4 className="font-semibold mb-4 text-blue-400 text-lg">Call to Action (CTA)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm text-gray-400 mb-2">Product Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={props.ctaLogoUrl}
                    onChange={(e) => props.setCtaLogoUrl(e.target.value)}
                    placeholder="https://example.com/product.png"
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {props.onOpenAssetSelector && (
                    <button
                      onClick={() => props.onOpenAssetSelector?.("cta-logo")}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                    >
                      Select
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Logo Scale</label>
                <input
                  type="number"
                  value={props.ctaLogoScale}
                  onChange={(e) => props.setCtaLogoScale(parseFloat(e.target.value))}
                  step="0.05"
                  min="0.1"
                  max="1"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Logo Offset X</label>
                <input
                  type="number"
                  value={props.ctaLogoOffsetX}
                  onChange={(e) => props.setCtaLogoOffsetX(parseInt(e.target.value))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Logo Offset Y</label>
                <input
                  type="number"
                  value={props.ctaLogoOffsetY}
                  onChange={(e) => props.setCtaLogoOffsetY(parseInt(e.target.value))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-400 mb-2">CTA Caption</label>
                <input
                  type="text"
                  value={props.ctaCaption}
                  onChange={(e) => props.setCtaCaption(e.target.value)}
                  placeholder="Shop Now!"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 mt-3">
              <input
                type="checkbox"
                checked={props.ctaBackgroundBlur}
                onChange={(e) => props.setCtaBackgroundBlur(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-400">Blur Background</span>
            </label>
          </div>

          {/* End Screen CTA */}
          <div>
            <h4 className="font-semibold mb-4 text-blue-400 text-lg">End Screen CTA</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm text-gray-400 mb-2">End Logo URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={props.endCtaLogoUrl}
                    onChange={(e) => props.setEndCtaLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {props.onOpenAssetSelector && (
                    <button
                      onClick={() => props.onOpenAssetSelector?.("end-cta-logo")}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                    >
                      Select
                    </button>
                  )}
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-400 mb-2">End Caption</label>
                <input
                  type="text"
                  value={props.endCtaCaption}
                  onChange={(e) => props.setEndCtaCaption(e.target.value)}
                  placeholder="Thank you for watching!"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Duration (seconds)</label>
                <input
                  type="number"
                  value={props.endCtaDuration}
                  onChange={(e) => props.setEndCtaDuration(parseInt(e.target.value))}
                  min="1"
                  max="10"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-400 mb-2">End Background URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={props.endCtaBackgroundUrl}
                    onChange={(e) => props.setEndCtaBackgroundUrl(e.target.value)}
                    placeholder="https://example.com/end-bg.jpg"
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {props.onOpenAssetSelector && (
                    <button
                      onClick={() => props.onOpenAssetSelector?.("end-cta-background")}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                    >
                      Select
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Background Music */}
          <div>
            <h4 className="font-semibold mb-4 text-blue-400 text-lg">Background Music</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm text-gray-400 mb-2">Music URL</label>
                <input
                  type="url"
                  value={props.musicUrl}
                  onChange={(e) => props.setMusicUrl(e.target.value)}
                  placeholder="https://example.com/music.mp3"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Volume (0-1)</label>
                <input
                  type="number"
                  value={props.musicVolume}
                  onChange={(e) => props.setMusicVolume(parseFloat(e.target.value))}
                  step="0.1"
                  min="0"
                  max="1"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Other Settings */}
          <div>
            <h4 className="font-semibold mb-4 text-blue-400 text-lg">Other Settings</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm text-gray-400 mb-2">Video Name</label>
                <input
                  type="text"
                  value={props.videoName}
                  onChange={(e) => props.setVideoName(e.target.value)}
                  placeholder="My Awesome Video"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <CustomSelect
                label="Model Version"
                value={props.modelVersion}
                onChange={(value) => props.setModelVersion(value as "standard" | "aurora_v1" | "aurora_v1_fast")}
                options={[
                  { value: "standard", label: "Standard" },
                  { value: "aurora_v1", label: "Aurora V1" },
                  { value: "aurora_v1_fast", label: "Aurora V1 Fast" }
                ]}
              />
              <div className="col-span-2">
                <label className="block text-sm text-gray-400 mb-2">Webhook URL (Optional)</label>
                <input
                  type="url"
                  value={props.webhookUrl}
                  onChange={(e) => props.setWebhookUrl(e.target.value)}
                  placeholder="https://example.com/webhook"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Receive notification when video generation completes</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
