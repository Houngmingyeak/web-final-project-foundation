import { useState } from 'react';
import { toast } from 'react-toastify';
import { useLoginMutation, useRegisterMutation } from '../features/auth/authApi';
import { useUpdatePasswordMutation } from '../features/profile/profileApi';

export function useOAuthSync() {
    const [login] = useLoginMutation();
    const [register] = useRegisterMutation();
    const [updatePassword] = useUpdatePasswordMutation();
    const [loading, setLoading] = useState('');

    const syncOAuthUser = async (user, providerName) => {
        setLoading(providerName.toLowerCase());

        // 1. Get Email (check both Top-level and providerData)
        const email = user.email || 
                      (user.providerData && user.providerData[0]?.email) || 
                      "";
        
        // 2. Set static Password for Social Login (most important for case without access to modify Backend)
        // This way helps Google and GitHub use the same password, so Backend allows entry
        const staticSalt = "SocialSync#MindStack2026";
        const passwordUnified = `OAuthUser@${email.length}${email.split('@')[0]}${staticSalt}`;
        const passwordFallback = `OAuthUser@${email.length}${user.uid.slice(0, 5)}`;

        // 3. Generate Username safely
        let username = "";
        const displayName = user.displayName || (user.providerData && user.providerData[0]?.displayName);
        
        if (displayName) {
            username = displayName.replace(/[^a-zA-Z0-9]/g, '');
        } else if (email && email.includes('@')) {
            username = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
        }

        if (!username || username.length < 3) {
            username = `user${user.uid.slice(0, 6)}`;
        }

        // 4. Stop if no Email
        if (!email) {
            toast.error(`Cannot retrieve email from ${providerName}. Please check Privacy in your Account.`);
            setLoading('');
            return false;
        }

        try {
            // Step 1: Try to Login with candidate passwords
            let loggedIn = false;
            let loginError = null;

            try {
                await login({ email, password: passwordUnified }).unwrap();
                loggedIn = true;
            } catch (errUnified) {
                loginError = errUnified;
                if (errUnified.status === 401 || errUnified.status === 404) {
                    try {
                        await login({ email, password: passwordFallback }).unwrap();
                        loggedIn = true;

                        // Self-healing migration: Update password to unified for next time
                        try {
                            await updatePassword({
                                oldPassword: passwordFallback,
                                newPassword: passwordUnified,
                                confirmedNewPassword: passwordUnified
                            }).unwrap();
                            console.log("OAuth Password migrated to Unified formula successfully.");
                        } catch (migErr) {
                            // Ignore migration failures as long as login succeeded
                            console.warn("OAuth Password migration failed:", migErr);
                        }
                    } catch (errFallback) {
                        loginError = errFallback;
                    }
                }
            }

            if (loggedIn) {
                toast.success(`Login with ${providerName} successful! 🎉`);
                setLoading('');
                return true;
            }

            throw loginError; // hit catch block below
        } catch (err) {
            // Step 2: If Login fails (maybe no account yet)
            const isUnauthorized = err.status === 401 || err.status === 404 || err.status === 403 || err.status === 400;
            
            if (isUnauthorized) {
                try {
                    // Register using the static Unified Password
                    await register({
                        username,
                        email,
                        password: passwordUnified,
                        confirmPassword: passwordUnified
                    }).unwrap();

                    // After Register, Login with Unified Password
                    await login({ email, password: passwordUnified }).unwrap();
                    
                    toast.success(`Account created and login with ${providerName} completed! 🎉`);
                    setLoading('');
                    return true;
                } catch (regErr) {
                    console.error("OAuth Sync Error:", regErr);
                    const msg = regErr?.data?.message || "";
                    
                    // If still Error 409, it means this Email was already Registered with normal Password (Manual)
                    if (regErr.status === 409 || msg.toLowerCase().includes('email')) {
                        toast.warning(`This email already exists with a different password. Please use a different email or Login normally.`);
                        toast.info(`💡 If you previously used another social provider (e.g. Google/GitHub), please login with that provider first so we can sync your accounts.`, { autoClose: 8000 });
                    } else {
                        toast.error(msg || `Technical issue with ${providerName}`);
                    }
                    setLoading('');
                    return false;
                }
            } else {
                toast.error(err?.data?.message || `Connection to Server failed`);
                setLoading('');
                return false;
            }
        }
    };

    return { syncOAuthUser, oauthLoading: loading };
}