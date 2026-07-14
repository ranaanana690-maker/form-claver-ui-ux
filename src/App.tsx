/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  GraduationCap, 
  Languages, 
  BookOpen, 
  Wrench, 
  CheckCircle2, 
  ChevronDown,
  User,
  Phone,
  Sparkles
} from 'lucide-react';

// --- Types & Data ---

type ServiceType = 'دروس الدعم' | 'اللغات' | 'تحفيظ القرآن' | 'التكوين المهني' | '';
type LevelType = 'ابتدائي' | 'متوسط' | 'ثانوي' | '';
type AgeGroupType = 'للكبار' | 'للصغار' | '';

const EDUCATION_YEARS: Record<string, string[]> = {
  'ابتدائي': ['السنة الأولى', 'السنة الثانية', 'السنة الثالثة', 'السنة الرابعة', 'السنة الخامسة'],
  'متوسط': ['السنة الأولى', 'السنة الثانية', 'السنة الثالثة', 'السنة الرابعة'],
  'ثانوي': ['السنة الأولى', 'السنة الثانية', 'السنة الثالثة'],
};

const VOCATIONAL_SPECIALTIES = [
  'إعلام آلي (برمجة وتصميم)',
  'محاسبة وتسيير',
  'صيانة الأجهزة الإلكترونية',
  'تصميم الأزياء والخياطة',
  'حلاقة وتجميل'
];

const LANGUAGES = ['الإنجليزية', 'الفرنسية', 'الإسبانية'];

// --- Components ---

const ShimmerLine = ({ width = "w-full", height = "h-4", className = "" }: { width?: string, height?: string, className?: string }) => (
  <div className={`${height} ${width} bg-slate-200 rounded-md relative overflow-hidden ${className}`}>
    <div className="absolute inset-0 animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
  </div>
);

const OptionCard = ({ 
  selected, 
  onClick, 
  icon: Icon, 
  label,
  description
}: { 
  selected: boolean, 
  onClick: () => void, 
  icon?: any, 
  label: string,
  description?: string
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 w-full text-center select-none active:scale-95 [-webkit-tap-highlight-color:transparent]
      ${selected 
        ? 'border-blue-600 bg-blue-50/80 shadow-md transform scale-[1.02]' 
        : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
      }
    `}
  >
    {Icon && <Icon className={`mb-3 transition-colors ${selected ? 'text-blue-600' : 'text-slate-400'}`} size={32} strokeWidth={1.5} />}
    <span className={`font-semibold transition-colors ${selected ? 'text-blue-900' : 'text-slate-700'}`}>{label}</span>
    {description && <span className="text-xs text-slate-500 mt-1">{description}</span>}
    
    {selected && (
      <motion.div 
        layoutId="outline"
        className="absolute inset-0 border-2 border-blue-600 rounded-2xl"
        initial={false}
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      />
    )}
  </button>
);

export default function App() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    serviceType: '' as ServiceType,
    level: '' as LevelType,
    year: '',
    language: '',
    ageGroup: '' as AgeGroupType,
    specialty: ''
  });

  const [status, setStatus] = useState<'filling' | 'submitting' | 'success'>('filling');
  const formRef = useRef<HTMLDivElement>(null);
  
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const submitRef = useRef<HTMLDivElement>(null);
  const yearsRef = useRef<HTMLDivElement>(null);

  const playSuccessFeedback = () => {
    // 1. Play magical synth chime (Web Audio API) for 100% reliability
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        
        const playNote = (freq: number, startTime: number, duration: number, vol = 0.3) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);
          
          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(vol, startTime + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
          
          osc.start(startTime);
          osc.stop(startTime + duration);
        };

        const now = ctx.currentTime;
        // Bright C-Major arpeggio "Tada"
        playNote(523.25, now, 0.3);        // C5
        playNote(659.25, now + 0.1, 0.3);  // E5
        playNote(783.99, now + 0.2, 0.3);  // G5
        playNote(1046.50, now + 0.3, 0.8, 0.5); // C6 (louder and longer)
      }
    } catch (e) {
      console.log('Audio API not supported', e);
    }

    // 2. Haptic Feedback (Vibration) - Tada pattern
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([50, 50, 50, 50, 50, 50, 200]);
    }
  };

  const updateForm = (key: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const isComplete = () => {
    if (!formData.fullName || !formData.phone || !formData.serviceType) return false;
    
    switch (formData.serviceType) {
      case 'دروس الدعم':
        return !!(formData.level && formData.year);
      case 'اللغات':
        return !!(formData.language && formData.ageGroup);
      case 'تحفيظ القرآن':
        return !!formData.ageGroup;
      case 'التكوين المهني':
        return !!formData.specialty;
      default:
        return false;
    }
  };

  const getActiveStep = () => {
    if (formData.fullName.length <= 2 || formData.phone.length < 10) return 1;
    if (!formData.serviceType) return 2;
    if (!isComplete()) return 3;
    return 4;
  };

  const activeStep = getActiveStep();

  useEffect(() => {
    const refs: Record<number, React.RefObject<HTMLDivElement | null>> = {
      1: step1Ref,
      2: step2Ref,
      3: step3Ref,
      4: submitRef
    };
    
    if (status !== 'filling') return;
    
    const currentRef = refs[activeStep];
    if (currentRef && currentRef.current) {
      setTimeout(() => {
        currentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 400); // Wait for AnimatePresence height animations
    }
  }, [activeStep, status]);

  useEffect(() => {
    if (formData.level && yearsRef.current) {
      setTimeout(() => {
        yearsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [formData.level]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete()) return;

    setStatus('submitting');
    
    // Labor Illusion: Intentional delay with Shimmer to increase perceived value
    setTimeout(() => {
      setStatus('success');
      
      // Fire confetti
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#3b82f6', '#10b981', '#f59e0b']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#3b82f6', '#10b981', '#f59e0b']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();

      // Play sound and haptics
      playSuccessFeedback();

    }, 2500); // 2.5 seconds of perceived "hard work" by the system
  };

  // Helper to determine if a section should be visible (Progressive Disclosure)
  const showServiceSelection = formData.fullName.length > 2 && formData.phone.length >= 10;

  return (
    <div dir="rtl" className="min-h-[100dvh] w-full bg-[#F8FAFC] font-sans text-slate-800 selection:bg-blue-200 flex flex-col items-center overflow-x-hidden no-scrollbar">
      
      <div className={`w-full max-w-2xl px-4 py-8 sm:py-12 flex flex-col ${status !== 'filling' ? 'flex-grow justify-center' : 'pb-32 sm:pb-12'}`} ref={formRef}>
        
        {/* Header */}
        {status === 'filling' && (
          <div className="text-center mb-8 sm:mb-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-sm mb-5 text-blue-600"
          >
            <GraduationCap size={40} strokeWidth={1.5} />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-4xl font-bold text-slate-900 mb-3 tracking-tight px-2"
          >
            أطلق العنان لإمكانياتك
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base text-slate-500 max-w-lg mx-auto leading-relaxed px-4"
          >
            نعلم مدى صعوبة العثور على التوجيه المناسب. مع خطتنا المخصصة، ستحقق هدفك بثقة وبدون تشتت. نحن هنا لنرشدك.
          </motion.p>
        </div>
        )}

        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[2rem] shadow-xl p-8 sm:p-12 text-center border border-slate-100 w-full"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 size={50} strokeWidth={2} />
              </motion.div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">لقد اتخذت الخطوة الأولى نحو النجاح!</h2>
              <p className="text-slate-600 text-base sm:text-lg mb-10 leading-relaxed">
                تهانينا يا <span className="font-semibold text-slate-900">{formData.fullName}</span>.<br/>
                خطتك لـ <span className="font-semibold text-blue-600">{formData.serviceType}</span> أصبحت جاهزة.<br/>
                مرشدك الخاص سيتواصل معك قريباً على <span dir="ltr" className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-700">{formData.phone}</span>.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="px-8 py-4 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-colors w-full sm:w-auto active:scale-95 [-webkit-tap-highlight-color:transparent]"
              >
                تسجيل جديد
              </button>
            </motion.div>
          ) : status === 'submitting' ? (
            <motion.div
              key="submitting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-[2rem] shadow-xl p-6 sm:p-10 border border-slate-100 min-h-[400px] flex flex-col justify-center"
            >
              <div className="space-y-8">
                <div className="text-center space-y-3 mb-8">
                  <Sparkles className="mx-auto text-blue-500 animate-pulse" size={40} />
                  <h3 className="text-xl sm:text-2xl font-semibold text-slate-700">يقوم خبراؤنا بتصميم خطة نجاحك...</h3>
                  <p className="text-slate-400 text-sm sm:text-base">ندرس خياراتك لضمان أفضل انطلاقة لك</p>
                </div>
                
                {/* Advanced Skeleton UI for "Labor Illusion" */}
                <div className="space-y-5 max-w-md mx-auto w-full">
                  <div className="flex items-center gap-4">
                    <ShimmerLine width="w-14" height="h-14" className="rounded-full flex-shrink-0" />
                    <div className="space-y-3 flex-grow">
                      <ShimmerLine width="w-1/3" height="h-3" />
                      <ShimmerLine width="w-2/3" height="h-3" />
                    </div>
                  </div>
                  <ShimmerLine height="h-28" className="rounded-2xl" />
                  <div className="grid grid-cols-2 gap-4">
                    <ShimmerLine height="h-12" className="rounded-xl" />
                    <ShimmerLine height="h-12" className="rounded-xl" />
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.form 
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              onSubmit={handleSubmit}
              className="space-y-5 sm:space-y-8"
            >
              {/* Step 1: Personal Info (Investment phase) */}
              <div 
                ref={step1Ref}
                className={`bg-white rounded-[2rem] shadow-sm border border-slate-200/60 p-5 sm:p-8 space-y-6 transition-all duration-500 ${
                  activeStep > 1 ? 'opacity-50 blur-[2px] hover:opacity-100 hover:blur-none focus-within:opacity-100 focus-within:blur-none' : ''
                }`}
              >
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0">1</div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-800">من أنت؟ (لنتعرف على البطل)</h2>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
                  <div className="space-y-2.5">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <User size={18} className="text-slate-400" /> الاسم الكامل
                    </label>
                    <input 
                      type="text" 
                      value={formData.fullName}
                      onChange={e => updateForm('fullName', e.target.value)}
                      onFocus={(e) => {
                        setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                      }}
                      placeholder="محمد بن علي"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 text-lg"
                    />
                  </div>
                  <div className="space-y-2.5">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Phone size={18} className="text-slate-400" /> رقم الهاتف
                    </label>
                    <input 
                      type="tel" 
                      dir="ltr"
                      value={formData.phone}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        updateForm('phone', val);
                        if (val.length === 10) {
                          e.target.blur();
                        }
                      }}
                      onFocus={(e) => {
                        setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                      }}
                      placeholder="0555 00 00 00"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 text-right text-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Main Service Type */}
              <AnimatePresence>
                {showServiceSelection && (
                  <motion.div 
                    ref={step2Ref}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className={`bg-white rounded-[2rem] shadow-sm border border-slate-200/60 p-5 sm:p-8 overflow-hidden transition-all duration-500 ${
                      activeStep > 2 ? 'opacity-50 blur-[2px] hover:opacity-100 hover:blur-none focus-within:opacity-100 focus-within:blur-none' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4 mb-6 sm:mb-8">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0">2</div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-800">ما هو هدفك؟</h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      <OptionCard 
                        label="دروس الدعم" 
                        icon={BookOpen}
                        selected={formData.serviceType === 'دروس الدعم'} 
                        onClick={() => updateForm('serviceType', 'دروس الدعم')} 
                      />
                      <OptionCard 
                        label="اللغات" 
                        icon={Languages}
                        selected={formData.serviceType === 'اللغات'} 
                        onClick={() => updateForm('serviceType', 'اللغات')} 
                      />
                      <OptionCard 
                        label="تحفيظ القرآن" 
                        icon={BookOpen}
                        selected={formData.serviceType === 'تحفيظ القرآن'} 
                        onClick={() => updateForm('serviceType', 'تحفيظ القرآن')} 
                      />
                      <OptionCard 
                        label="التكوين المهني" 
                        icon={Wrench}
                        selected={formData.serviceType === 'التكوين المهني'} 
                        onClick={() => updateForm('serviceType', 'التكوين المهني')} 
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step 3: Dynamic Details based on Service Type */}
              <AnimatePresence mode="wait">
                {formData.serviceType && (
                  <motion.div
                    ref={step3Ref}
                    key={formData.serviceType}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`bg-white rounded-[2rem] shadow-sm border border-slate-200/60 p-5 sm:p-8 transition-all duration-500 ${
                      activeStep > 3 ? 'opacity-50 blur-[2px] hover:opacity-100 hover:blur-none focus-within:opacity-100 focus-within:blur-none' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4 mb-6 sm:mb-8">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0">3</div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-800">خطة العمل المخصصة لك</h2>
                    </div>

                    <div className="space-y-6 sm:space-y-8">
                      
                      {/* Dynamic: دروس الدعم */}
                      {formData.serviceType === 'دروس الدعم' && (
                        <div className="space-y-6 sm:space-y-8">
                          <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-4">الطور الدراسي</label>
                            <div className="grid grid-cols-3 gap-3">
                              {Object.keys(EDUCATION_YEARS).map(lvl => (
                                <button
                                  key={lvl}
                                  type="button"
                                  onClick={() => {
                                    updateForm('level', lvl);
                                    updateForm('year', ''); // Reset year when level changes
                                  }}
                                  className={`p-3.5 rounded-2xl border-2 text-sm sm:text-base font-bold transition-all active:scale-95 [-webkit-tap-highlight-color:transparent] ${formData.level === lvl ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300'}`}
                                >
                                  {lvl}
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <AnimatePresence>
                            {formData.level && (
                              <motion.div ref={yearsRef} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden pt-4">
                                <label className="text-sm font-semibold text-slate-700 block mb-4">السنة الدراسية</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                  {EDUCATION_YEARS[formData.level]?.map(yr => (
                                    <button
                                      key={yr}
                                      type="button"
                                      onClick={() => updateForm('year', yr)}
                                      className={`p-3.5 rounded-2xl border-2 text-sm sm:text-base font-bold transition-all active:scale-95 [-webkit-tap-highlight-color:transparent] ${formData.year === yr ? 'bg-blue-100 text-blue-800 border-blue-400' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-blue-200'}`}
                                    >
                                      {yr}
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      {/* Dynamic: اللغات */}
                      {formData.serviceType === 'اللغات' && (
                        <div className="space-y-6 sm:space-y-8">
                          <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-4">اللغة المراد تعلمها</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {LANGUAGES.map(lang => (
                                <button
                                  key={lang}
                                  type="button"
                                  onClick={() => updateForm('language', lang)}
                                  className={`p-4 rounded-2xl border-2 text-base font-bold transition-all active:scale-95 [-webkit-tap-highlight-color:transparent] ${formData.language === lang ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300'}`}
                                >
                                  {lang}
                                </button>
                              ))}
                            </div>
                          </div>
                          <AgeGroupSelector current={formData.ageGroup} onSelect={(val) => updateForm('ageGroup', val)} />
                        </div>
                      )}

                      {/* Dynamic: تحفيظ القرآن */}
                      {formData.serviceType === 'تحفيظ القرآن' && (
                        <div>
                           <AgeGroupSelector current={formData.ageGroup} onSelect={(val) => updateForm('ageGroup', val)} />
                        </div>
                      )}

                      {/* Dynamic: التكوين المهني */}
                      {formData.serviceType === 'التكوين المهني' && (
                        <div>
                          <label className="text-sm font-semibold text-slate-700 block mb-4">التخصص المطلوب</label>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {VOCATIONAL_SPECIALTIES.map(spec => (
                              <button
                                key={spec}
                                type="button"
                                onClick={() => updateForm('specialty', spec)}
                                className={`p-4 rounded-2xl border-2 text-right text-base font-bold transition-all flex items-center justify-between active:scale-95 [-webkit-tap-highlight-color:transparent] ${formData.specialty === spec ? 'bg-blue-50 text-blue-800 border-blue-400' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-blue-200'}`}
                              >
                                {spec}
                                {formData.specialty === spec && <CheckCircle2 size={20} className="text-blue-600" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <AnimatePresence>
                {isComplete() && (
                  <motion.div
                    ref={submitRef}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-8 pb-4"
                  >
                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg sm:text-xl py-4 sm:py-5 rounded-2xl shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 [-webkit-tap-highlight-color:transparent]"
                    >
                      أكد خطتي الآن
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Sub-component for reuse
const AgeGroupSelector = ({ current, onSelect }: { current: AgeGroupType, onSelect: (val: AgeGroupType) => void }) => (
  <div>
    <label className="text-sm font-semibold text-slate-700 block mb-4">البطل المُستهدف</label>
    <div className="grid grid-cols-2 gap-3">
      {(['للكبار', 'للصغار'] as AgeGroupType[]).map(age => (
        <button
          key={age}
          type="button"
          onClick={() => onSelect(age)}
          className={`p-4 rounded-2xl border-2 text-base font-bold transition-all active:scale-95 [-webkit-tap-highlight-color:transparent] ${current === age ? 'bg-indigo-100 text-indigo-800 border-indigo-400' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-indigo-200'}`}
        >
          {age}
        </button>
      ))}
    </div>
  </div>
);