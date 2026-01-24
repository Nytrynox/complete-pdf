'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { LucideIcon, ArrowRight } from 'lucide-react';

interface ToolCardProps {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color?: string;
  bgColor?: string;
  index?: number;
}

export function ToolCard({ 
  id, 
  name, 
  description, 
  icon: Icon, 
  color = 'from-red-500 to-rose-600',
  bgColor = 'bg-red-50',
  index = 0 
}: ToolCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Link href={`/pdf-tools/${id}`}>
        <div className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
          {/* Icon Container */}
          <div className={`w-14 h-14 rounded-xl ${bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-7 h-7 text-gray-700" />
          </div>
          
          {/* Content */}
          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-red-500 transition-colors">
            {name}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            {description}
          </p>
          
          {/* Arrow indicator */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="w-5 h-5 text-red-500" />
          </div>

          {/* Bottom gradient line on hover */}
          <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl`} />
        </div>
      </Link>
    </motion.div>
  );
}

export default ToolCard;
