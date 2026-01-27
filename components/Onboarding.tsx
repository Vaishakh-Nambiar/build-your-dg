import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface OnboardingProps {
    onComplete: (data: { name: string; interest: string }) => void;
}

export const Onboarding = ({ onComplete }: OnboardingProps) => {
    const [step, setStep] = useState<number>(0);
    const [name, setName] = useState('');
    const [interest, setInterest] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (step === 0 && name.trim()) {
            setStep(1);
        } else if (step === 1 && interest.trim()) {
            onComplete({ name, interest });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, pointerEvents: "none" }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#F9F9F9] text-black p-6"
        >
            <div className="w-full max-w-md">
                <form onSubmit={handleSubmit} className="flex flex-col items-center text-center">

                    <motion.div
                        key={step}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full"
                    >
                        {step === 0 ? (
                            <>
                                <label htmlFor="name" className="block font-serif-display text-4xl sm:text-5xl italic mb-8 text-black/90">
                                    What shall we call this garden?
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. The Archive"
                                    className="w-full border-b border-black/10 bg-transparent py-4 text-center text-2xl font-light focus:border-black focus:outline-none placeholder:text-black/20"
                                    autoFocus
                                />
                            </>
                        ) : (
                            <>
                                <label htmlFor="interest" className="block font-serif-display text-4xl sm:text-5xl italic mb-8 text-black/90">
                                    And your primary pursuit?
                                </label>
                                <input
                                    id="interest"
                                    type="text"
                                    value={interest}
                                    onChange={(e) => setInterest(e.target.value)}
                                    placeholder="e.g. Photography"
                                    className="w-full border-b border-black/10 bg-transparent py-4 text-center text-2xl font-light focus:border-black focus:outline-none placeholder:text-black/20"
                                    autoFocus
                                />
                            </>
                        )}
                    </motion.div>

                    <button
                        type="submit"
                        className="mt-12 group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-black px-8 py-3 font-medium text-white transition duration-300 hover:w-32 hover:bg-neutral-800"
                    >
                        <span className="mr-2">Next</span>
                        <span className="opacity-70 group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                </form>
            </div>
        </motion.div>
    );
};
