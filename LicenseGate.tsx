import React, { useState, useEffect } from 'react';
import LicenseActivationPage from './LicenseActivationPage.tsx';

const LICENSE_KEY = 'hanjlaHarryLicense_v1';

const LicenseGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLicensed, setIsLicensed] = useState<boolean | null>(null);

    useEffect(() => {
        try {
            const licenseData = localStorage.getItem(LICENSE_KEY);
            if (!licenseData) {
                setIsLicensed(false);
                return;
            }

            const { expiry } = JSON.parse(licenseData);
            if (typeof expiry === 'number' && Date.now() < expiry) {
                setIsLicensed(true);
            } else {
                localStorage.removeItem(LICENSE_KEY); // Clean up expired license
                setIsLicensed(false);
            }
        } catch (err) {
            console.error("Error validating license:", err);
            localStorage.removeItem(LICENSE_KEY);
            setIsLicensed(false);
        }
    }, []);

    // While checking, render nothing to avoid flashes of content
    if (isLicensed === null) {
        return null;
    }

    if (isLicensed) {
        return <>{children}</>;
    }

    return <LicenseActivationPage />;
};

export default LicenseGate;
