'use client';

import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRef, useState, useMemo } from 'react';
import { 
  FileStack, Scissors, FileDown, RotateCw, Lock, Unlock, 
  FileImage, Image as ImageIcon, Stamp, FileText, ScanLine, FileType,
  Trash2, GripVertical, Hash, Eraser, FilePlus, FileCheck, 
  Crop, FileSearch, Camera, FileSpreadsheet, Presentation, 
  Wrench, Archive, Check, Edit, PenTool, 
  Shield, Layers, Type, ImagePlus, CheckSquare,
  FileDown as FileExport, Replace, FormInput, ListChecks,
  LucideIcon, Search, Github, Linkedin, Globe, Heart, X, Menu, Mail, Zap, ArrowRight, Sparkles, Play, Star
} from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
}

const toolCategories = [
  {
    name: 'Edit PDF',
    color: 'from-red-500 to-rose-600',
    bgColor: 'bg-red-50',
    iconColor: 'text-red-600',
    tools: [
      { id: 'edit', name: 'Edit PDF', icon: Edit, description: 'Add text, images, shapes' },
      { id: 'create-pdf', name: 'Create PDF', icon: FilePlus, description: 'Generate new PDFs' },
      { id: 'replace-text', name: 'Replace Text', icon: Replace, description: 'Find and replace' },
      { id: 'add-text-fields', name: 'Text Fields', icon: FormInput, description: 'Add fillable fields' },
      { id: 'add-text', name: 'Add Text', icon: Type, description: 'Insert text' },
      { id: 'add-images', name: 'Add Images', icon: ImagePlus, description: 'Insert images' },
      { id: 'erase', name: 'Erase', icon: Eraser, description: 'Remove content' },
      { id: 'watermark', name: 'Watermark', icon: Stamp, description: 'Add watermarks' },
      { id: 'spell-check', name: 'Spell Check', icon: FileCheck, description: 'Fix spelling' },
      { id: 'page-numbers', name: 'Page Numbers', icon: Hash, description: 'Add numbering' },
    ] as Tool[]
  },
  {
    name: 'Convert to PDF',
    color: 'from-emerald-500 to-green-600',
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    tools: [
      { id: 'jpg-to-pdf', name: 'JPG to PDF', icon: ImageIcon, description: 'Images to PDF' },
      { id: 'word-to-pdf', name: 'Word to PDF', icon: FileText, description: 'DOC to PDF' },
      { id: 'powerpoint-to-pdf', name: 'PPT to PDF', icon: Presentation, description: 'Slides to PDF' },
      { id: 'excel-to-pdf', name: 'Excel to PDF', icon: FileSpreadsheet, description: 'XLS to PDF' },
      { id: 'html-to-pdf', name: 'HTML to PDF', icon: FileType, description: 'Web to PDF' },
      { id: 'scan-to-pdf', name: 'Scan to PDF', icon: Camera, description: 'Scan to PDF' },
    ] as Tool[]
  },
  {
    name: 'Convert from PDF',
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    tools: [
      { id: 'pdf-to-jpg', name: 'PDF to JPG', icon: FileImage, description: 'PDF to images' },
      { id: 'pdf-to-word', name: 'PDF to Word', icon: FileText, description: 'PDF to DOC' },
      { id: 'pdf-to-powerpoint', name: 'PDF to PPT', icon: Presentation, description: 'PDF to slides' },
      { id: 'pdf-to-excel', name: 'PDF to Excel', icon: FileSpreadsheet, description: 'PDF to XLS' },
      { id: 'export', name: 'Export', icon: FileExport, description: 'Export PDF' },
    ] as Tool[]
  },
  {
    name: 'Organize',
    color: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
    tools: [
      { id: 'merge', name: 'Merge', icon: FileStack, description: 'Combine PDFs' },
      { id: 'split', name: 'Split', icon: Scissors, description: 'Divide PDF' },
      { id: 'organize', name: 'Organize', icon: GripVertical, description: 'Rearrange' },
      { id: 'rotate', name: 'Rotate', icon: RotateCw, description: 'Rotate pages' },
      { id: 'remove-pages', name: 'Remove', icon: Trash2, description: 'Delete pages' },
      { id: 'extract', name: 'Extract', icon: FileDown, description: 'Extract pages' },
      { id: 'insert-pages', name: 'Insert', icon: FilePlus, description: 'Add pages' },
      { id: 'crop', name: 'Crop', icon: Crop, description: 'Crop PDF' },
    ] as Tool[]
  },
  {
    name: 'eSign & Forms',
    color: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-50',
    iconColor: 'text-pink-600',
    tools: [
      { id: 'sign', name: 'Sign PDF', icon: PenTool, description: 'Add signature' },
      { id: 'request-signatures', name: 'Request Signs', icon: FileText, description: 'Get signatures' },
      { id: 'create-template', name: 'Templates', icon: FileText, description: 'Save templates' },
      { id: 'fill-forms', name: 'Fill Forms', icon: FileCheck, description: 'Complete forms' },
      { id: 'create-fillable', name: 'Create Forms', icon: FormInput, description: 'Make forms' },
      { id: 'add-checkboxes', name: 'Checkboxes', icon: CheckSquare, description: 'Add checkboxes' },
      { id: 'populate-forms', name: 'Populate', icon: ListChecks, description: 'Pre-fill' },
    ] as Tool[]
  },
  {
    name: 'Security',
    color: 'from-slate-600 to-gray-700',
    bgColor: 'bg-slate-50',
    iconColor: 'text-slate-600',
    tools: [
      { id: 'compress', name: 'Compress', icon: Wrench, description: 'Reduce size' },
      { id: 'protect', name: 'Protect', icon: Lock, description: 'Add password' },
      { id: 'unlock', name: 'Unlock', icon: Unlock, description: 'Remove password' },
      { id: 'redact', name: 'Redact', icon: Eraser, description: 'Remove info' },
      { id: 'repair', name: 'Repair', icon: Wrench, description: 'Fix PDF' },
    ] as Tool[]
  },
];

const allTools = toolCategories.flatMap(cat => 
  cat.tools.map(tool => ({ ...tool, category: cat.name, bgColor: cat.bgColor, color: cat.color, iconColor: cat.iconColor }))
);
const totalTools = allTools.length;

function SearchBar({ onClose }: { onClose?: () => void }) {
  const [query, setQuery] = useState('');
  const filteredTools = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allTools.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Search 50+ tools..."
          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none text-sm bg-white transition-all font-medium" />
        {onClose && <button onClick={onClose} className="absolute right-4 top-1/2 -translate-y-1/2"><X className="w-5 h-5 text-gray-400" /></button>}
      </div>
      {filteredTools.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
          {filteredTools.map(tool => (
            <Link key={tool.id} href={`/pdf-tools/${tool.id}`} onClick={onClose}>
              <div className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className={`w-10 h-10 rounded-xl ${tool.bgColor} flex items-center justify-center`}>
                  <tool.icon className={`w-5 h-5 ${tool.iconColor}`} />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{tool.name}</div>
                  <div className="text-xs text-gray-500">{tool.category}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function ToolCard({ tool, bgColor, iconColor, index }: { tool: Tool; bgColor: string; iconColor: string; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.4, delay: index * 0.03 }}>
      <Link href={`/pdf-tools/${tool.id}`}>
        <div className="group bg-white rounded-2xl p-5 border border-gray-100 hover:border-red-200 hover:shadow-xl hover:shadow-red-500/5 transition-all duration-300 hover:-translate-y-1 h-full">
          <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
            <tool.icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-red-600 transition-colors">{tool.name}</h3>
          <p className="text-sm text-gray-500">{tool.description}</p>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Home() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  const handlePayment = (amount: number) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      const options = {
        key: 'rzp_live_S7dFtOLsDq4nPK',
        amount: amount * 100,
        currency: 'INR',
        name: 'Complete PDF',
        description: `Support Developer - Rs ${amount}`,
        handler: () => alert('Thank you for your support!'),
        theme: { color: '#dc2626' }
      };
      new (window as any).Razorpay(options).open();
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      {/* ===== REDESIGNED HEADER ===== */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="Complete PDF" className="w-11 h-11 rounded-2xl" />
            <div>
              <span className="text-xl font-bold text-gray-900">Complete PDF</span>
              <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Free Forever</div>
            </div>
          </Link>

          <div className="hidden lg:block flex-1 max-w-lg mx-8">
            <SearchBar />
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="#tools" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Tools</Link>
            <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Features</Link>
            <Link href="#support" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Support</Link>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 rounded-full">
              <span className="text-xs font-semibold text-red-500">BETA</span>
              <span className="text-xs text-gray-400">v1.0 Soon</span>
            </div>
          </nav>

          <div className="flex items-center gap-3">
            <button onClick={() => setSearchOpen(true)} className="lg:hidden p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2.5 bg-gray-100 rounded-xl">
              {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenu && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="md:hidden border-t border-gray-100 bg-white p-6">
            <nav className="flex flex-col gap-4">
              <Link href="#tools" onClick={() => setMobileMenu(false)} className="py-3 px-4 rounded-xl hover:bg-gray-50 font-medium">Tools</Link>
              <Link href="#features" onClick={() => setMobileMenu(false)} className="py-3 px-4 rounded-xl hover:bg-gray-50 font-medium">Features</Link>
              <Link href="#support" onClick={() => setMobileMenu(false)} className="py-3 px-4 rounded-xl hover:bg-gray-50 font-medium">Support</Link>
            </nav>
          </motion.div>
        )}
      </header>

      {/* Mobile Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl">
            <SearchBar onClose={() => setSearchOpen(false)} />
          </motion.div>
        </div>
      )}

      {/* ===== REDESIGNED HERO SECTION ===== */}
      <section ref={heroRef} className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-red-50/30" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-red-100/40 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-rose-100/30 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        
        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="relative max-w-7xl mx-auto px-6 pt-20 pb-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-sm font-medium">
                <Sparkles className="w-4 h-4 text-red-500" />
                <span className="text-gray-600">{totalTools}+ Professional PDF Tools</span>
                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">FREE</span>
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
              Every PDF Tool You{' '}
              <span className="relative">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-600">Need</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                  <path d="M2 10C50 2 150 2 198 10" stroke="url(#gradient)" strokeWidth="4" strokeLinecap="round"/>
                  <defs><linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#ef4444"/><stop offset="100%" stopColor="#e11d48"/></linearGradient></defs>
                </svg>
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Edit, convert, merge, split & compress PDFs online. 100% free, no registration required. Your files are processed locally and never stored.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="#tools" className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-2xl font-semibold text-lg hover:shadow-xl hover:shadow-red-500/25 transition-all hover:-translate-y-0.5">
                Explore All Tools
              </Link>
              <Link href="/pdf-tools/edit" className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 rounded-2xl font-semibold text-lg border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
                <Play className="w-5 h-5 text-red-500" />
                Try Edit PDF
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ===== ENDLESS SCROLL FEATURES ===== */}
      <section className="py-6 bg-gray-50 border-y border-gray-100 overflow-hidden">
        <motion.div 
          className="flex gap-8"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        >
          {[...Array(2)].map((_, setIdx) => (
            <div key={setIdx} className="flex gap-8">
              {[
                { icon: Shield, text: '100% Secure', link: '#features' },
                { icon: Zap, text: 'Lightning Fast', link: '#features' },
                { icon: Globe, text: 'Works Offline', link: '#features' },
                { icon: Lock, text: 'No Upload Required', link: '#features' },
                { icon: Check, text: 'Always Free', link: '#features' },
                { icon: Sparkles, text: 'No Registration', link: '#features' },
                { icon: Shield, text: 'Privacy First', link: '#features' },
                { icon: Zap, text: 'Instant Results', link: '#features' },
              ].map((item, idx) => (
                <Link 
                  key={`${setIdx}-${idx}`} 
                  href={item.link}
                  className="flex items-center gap-3 px-6 py-3 bg-white rounded-full border border-gray-200 whitespace-nowrap hover:border-red-300 hover:shadow-md transition-all cursor-pointer"
                >
                  <item.icon className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-gray-700">{item.text}</span>
                </Link>
              ))}
            </div>
          ))}
        </motion.div>
      </section>

      {/* Tools Grid Section */}
      <section id="tools" className="py-24 px-6 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">All PDF Tools</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">Everything you need to work with PDFs, organized by category</p>
          </div>

          <div className="space-y-16">
            {toolCategories.map((cat) => (
              <div key={cat.name}>
                <div className="flex items-center gap-4 mb-8">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center`}>
                    <Layers className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{cat.name}</h3>
                    <p className="text-sm text-gray-500">{cat.tools.length} tools</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {cat.tools.map((tool, i) => <ToolCard key={tool.id} tool={tool} bgColor={cat.bgColor} iconColor={cat.iconColor} index={i} />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Why Choose Complete PDF?</h2>
              <p className="text-lg text-gray-600 mb-10">Built with privacy and performance in mind. Your files never leave your device.</p>
              
              <div className="space-y-6">
                {[
                  { icon: Shield, title: 'Privacy First', desc: 'All processing happens in your browser. Files are never uploaded.' },
                  { icon: Zap, title: 'Lightning Fast', desc: 'No server delays. Instant results right on your device.' },
                  { icon: Lock, title: 'Enterprise Security', desc: 'Bank-level encryption for all file operations.' },
                  { icon: Check, title: 'Always Free', desc: 'No hidden fees, no subscriptions, no limits.' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                      <item.icon className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-red-500 to-rose-600 rounded-3xl p-10 text-white">
                <div className="h-full bg-white/10 rounded-2xl backdrop-blur-sm p-8 flex flex-col justify-between">
                  <div className="text-6xl font-bold">{totalTools}+</div>
                  <div>
                    <div className="text-2xl font-semibold mb-2">Professional Tools</div>
                    <div className="text-white/80">All completely free with no watermarks or restrictions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== REDESIGNED SUPPORT SECTION ===== */}
      <section id="support" className="py-24 px-6 bg-gradient-to-b from-gray-900 to-gray-950 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-red-500/10 to-transparent rounded-full blur-3xl" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              {/* Developer Photo */}
              <div className="relative inline-block mb-8">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl">
                  <Image src="/developer.jpg" alt="Karthik Idikuda" width={128} height={128} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                  <Heart className="w-5 h-5 text-white fill-white" />
                </div>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Support the Developer</h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
                Hi! I'm <span className="text-white font-semibold">Karthik Idikuda</span>, the creator of Complete PDF. 
                Your support helps keep this project free for everyone.
              </p>
              
              {/* Social Links */}
              <div className="flex items-center justify-center gap-4 mb-12">
                <a href="https://github.com/Nytrynox/landing-page" target="_blank" className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10">
                  <Github className="w-5 h-5 text-white" />
                </a>
                <a href="https://www.linkedin.com/in/karthik129259/" target="_blank" className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10">
                  <Linkedin className="w-5 h-5 text-white" />
                </a>
                <a href="https://www.karthikidikuda.dev/" target="_blank" className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10">
                  <Globe className="w-5 h-5 text-white" />
                </a>
              </div>
            </motion.div>
          </div>

          {/* Donation Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 md:p-12">
            <h3 className="text-xl font-semibold text-white text-center mb-8">Choose an amount to support</h3>
            
            {/* Amount Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[29, 49, 99, 199].map((amount) => (
                <button
                  key={amount}
                  onClick={() => handlePayment(amount)}
                  className="group py-6 bg-white/5 hover:bg-gradient-to-br hover:from-red-500 hover:to-rose-600 rounded-2xl border border-white/10 hover:border-transparent transition-all"
                >
                  <div className="text-gray-400 group-hover:text-white/80 text-sm mb-1">INR</div>
                  <div className="text-2xl font-bold text-white">₹{amount}</div>
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Enter custom amount"
                  className="w-full pl-10 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 outline-none focus:border-red-500 transition-colors"
                />
              </div>
              <button
                onClick={() => customAmount && handlePayment(parseInt(customAmount))}
                className="px-8 py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-2xl font-semibold hover:shadow-lg hover:shadow-red-500/25 transition-all whitespace-nowrap"
              >
                Donate Now
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== REDESIGNED FOOTER ===== */}
      <footer className="bg-gray-950 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center gap-3 mb-6">
                <img src="/logo.png" alt="Complete PDF" className="w-10 h-10 rounded-xl" />
                <span className="text-xl font-bold">Complete PDF</span>
              </Link>
              <p className="text-gray-400 mb-6">Free online PDF tools for everyone. No registration required.</p>
              <div className="flex gap-3">
                <a href="mailto:idikudakarthik55@gmail.com" className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                  <Mail className="w-5 h-5" />
                </a>
                <a href="https://github.com/Nytrynox/landing-page" target="_blank" className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="https://www.linkedin.com/in/karthik129259/" target="_blank" className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Popular Tools */}
            <div>
              <h4 className="font-semibold mb-6">Popular Tools</h4>
              <ul className="space-y-3 text-gray-400">
                {['edit', 'merge', 'compress', 'pdf-to-word', 'sign'].map((tool) => (
                  <li key={tool}>
                    <Link href={`/pdf-tools/${tool}`} className="hover:text-white transition-colors capitalize">
                      {tool.replace(/-/g, ' ')}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-6">Legal</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-6">Contact</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:idikudakarthik55@gmail.com" className="hover:text-white transition-colors">idikudakarthik55@gmail.com</a>
                </li>
                <li className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <a href="https://www.karthikidikuda.dev" target="_blank" className="hover:text-white transition-colors">karthikidikuda.dev</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <p>© 2026 Complete PDF. All rights reserved.</p>
            <p>Made with <Heart className="w-4 h-4 inline text-red-500 fill-red-500 mx-1" /> by Karthik Idikuda</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
