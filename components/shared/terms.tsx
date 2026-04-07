"use client"
import React, { useState } from 'react';

const Terms = () => {

    return (
        <div className="max-w-4xl mx-auto p-6 bg-background text-forground font-sans">
            <section className="space-y-4">
                <h1 className="text-3xl font-bold">Terms of Service</h1>
                <p className="text-sm text-slate-500">Last Updated: April 7, 2026</p>
                <div>
                    <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
                    <p className='text-sm text-gray-400'>By using UFL, you agree to these terms. If you are using the AI features, you acknowledge that AI-generated suggestions are for guidance only and should be reviewed by you for accuracy.</p>
                </div>
                <div>
                    <h2 className="text-xl font-semibold">2. User Responsibility</h2>
                    <p className='text-sm text-gray-400'>You are responsible for maintaining the security of your account. UFL provides the tools for discipline, but the user is responsible for the execution of tasks.</p>
                </div>
                <div>
                    <h2 className="text-xl font-semibold">3. AI Limitations</h2>
                    <p className='text-sm text-gray-400'>When using AI to create "Paths," you understand that LLMs may occasionally produce unexpected results. Manual task creation remains entirely under your control and does not involve AI processing.</p>
                </div>
                <div>
                    <h2 className="text-xl font-semibold">4. Prohibited Use</h2>
                    <p className='text-sm text-gray-400'>You may not use UFL to track illegal activities or attempt to reverse-engineer our automation integrations.</p>
                </div>
            </section>
        </div>
    );
};

export default Terms;