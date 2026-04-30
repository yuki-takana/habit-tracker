"use client"

import React, { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { UflLoaderInline } from '@/components/ui/ufl-loader'

interface FeatureGateGuardProps {
    children: React.ReactNode;
    config: any;
}

const FEATURE_MAPPING: Record<string, string> = {
    '/dashboard': 'feature_dashboard',
    '/insights': 'feature_insights',
    '/habits': 'feature_habits',
    '/todos': 'feature_todos',
    '/challenges': 'feature_challenges',
    '/workouts': 'feature_workouts',
};

export default function FeatureGateGuard({ children, config }: FeatureGateGuardProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [isAllowed, setIsAllowed] = React.useState(true)
    const [isChecking, setIsChecking] = React.useState(true)

    useEffect(() => {
        // Find which feature this path belongs to
        const featureKey = Object.entries(FEATURE_MAPPING).find(([path]) => 
            pathname === path || pathname.startsWith(path + '/')
        )?.[1]

        if (featureKey && config && config[featureKey] === 'false') {
            setIsAllowed(false)
            // Redirect to a safe page (e.g., Billing or waitlist or coding)
            // If dashboard is disabled, maybe coding or blueprint?
            // To prevent infinite redirects, check if the target is already restricted
            const target = pathname === '/dashboard' ? '/coding' : '/dashboard'
            router.push(target)
        } else {
            setIsAllowed(true)
        }
        setIsChecking(false)
    }, [pathname, config, router])

    if (isChecking) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <UflLoaderInline style="pulse-dots" />
            </div>
        )
    }

    if (!isAllowed) return null

    return <>{children}</>
}

