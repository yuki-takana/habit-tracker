'use client';

import { useState, useEffect } from 'react';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { CheckCircle, Smartphone, AlertCircle } from 'lucide-react'; 
import { saveUserPhone } from '@/app/action';

interface PhoneVerificationProps {
  initialValue?: string | null;
  isEnabled?: boolean;
}

export default function PhoneVerification({ initialValue, isEnabled }: PhoneVerificationProps) {
    // Initialize state with props from the database
    const [value, setValue] = useState<string | undefined>(initialValue ?? undefined);
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        if (value && isValidPhoneNumber(value)) {
            setLoading(true);
            try {
                await saveUserPhone(value);
                setSaved(true);
                setTimeout(() => setSaved(false), 3000); 
            } catch (err) {
                console.error(err);
                alert("Failed to save. Please try again.");
            } finally {
                setLoading(false);
            }
        } else {
            alert("Please enter a valid phone number with country code.");
        }
    };

    return (
        <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Smartphone className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">WhatsApp Notifications</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {isEnabled ? "Notifications are active" : "Get reminders directly on your phone"}
                        </p>
                    </div>
                </div>
                {isEnabled && (
                    <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Active
                    </span>
                )}
            </div>

            <div className="space-y-4">
                <div className="relative">
                    <PhoneInput
                        placeholder="Enter phone number"
                        value={value}
                        onChange={setValue}
                        defaultCountry="IN"
                        className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus-within:ring-2 focus-within:ring-green-500 transition-all"
                    />
                </div>

                <button
                    onClick={handleSave}
                    // disabled={loading || !value || (value === initialValue && isEnabled && !saved)}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                        saved
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 active:scale-[0.98]'
                    } disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed`}
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : saved ? (
                        <><CheckCircle className="w-5 h-5" /> Number Updated</>
                    ) : (
                        'Update Phone Number'
                    )}
                </button>
            </div>

            {!isEnabled && (
                <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                        Reminders are currently disabled. Enter your number and click save to enable.
                    </p>
                </div>
            )}
        </div>
    );
}