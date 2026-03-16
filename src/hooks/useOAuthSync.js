import { useState } from 'react';
import { toast } from 'react-toastify';
import { useLoginMutation, useRegisterMutation } from '../features/auth/authApi';

export function useOAuthSync() {
    const [login] = useLoginMutation();
    const [register] = useRegisterMutation();
    const [loading, setLoading] = useState('');

    const syncOAuthUser = async (user, providerName) => {
        setLoading(providerName.toLowerCase());

        // ១. ទាញយក Email (ឆែកទាំង Top-level និង providerData)
        const email = user.email || 
                      (user.providerData && user.providerData[0]?.email) || 
                      "";
        
        // ២. កំណត់ Password រួមមួយសម្រាប់ Social Login (សំខាន់បំផុតសម្រាប់ករណីគ្មានសិទ្ធិកែ Backend)
        // វិធីនេះជួយឱ្យ Google និង GitHub ប្រើ Password ដូចគ្នា ទើប Backend ព្រមឱ្យចូល
        const oauthPassword = `OAuthUser@${email.length}${user.uid.slice(0, 5)}`;

        // ៣. បង្កើត Username ដោយសុវត្ថិភាព
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

        // ៤. បញ្ឈប់បើគ្មាន Email
        if (!email) {
            toast.error(`មិនអាចទាញយកអ៊ីមែលពី ${providerName} បានទេ។ សូមពិនិត្យ Privacy ក្នុង Account របស់អ្នក។`);
            setLoading('');
            return false;
        }

        try {
            // ជំហានទី ១: ព្យាយាម Login ជាមួយ Password រួម
            await login({ email, password: oauthPassword }).unwrap();
            toast.success(`ចូលប្រើជាមួយ ${providerName} ជោគជ័យ! 🎉`);
            setLoading('');
            return true;
        } catch (err) {
            // ជំហានទី ២: បើ Login បរាជ័យ (ប្រហែលជាមិនទាន់មាន Account)
            const isUnauthorized = err.status === 401 || err.status === 404 || err.status === 403 || err.status === 400;
            
            if (isUnauthorized) {
                try {
                    // ធ្វើការចុះឈ្មោះ (Register) ដោយប្រើ Password រួមនោះដែរ
                    await register({
                        username,
                        email,
                        password: oauthPassword,
                        confirmPassword: oauthPassword
                    }).unwrap();

                    // បន្ទាប់ពី Register រួច ហៅ Login ម្ដងទៀត
                    await login({ email, password: oauthPassword }).unwrap();
                    
                    toast.success(`បង្កើតគណនី និងចូលប្រើជាមួយ ${providerName} រួចរាល់! 🎉`);
                    setLoading('');
                    return true;
                } catch (regErr) {
                    console.error("OAuth Sync Error:", regErr);
                    const msg = regErr?.data?.message || "";
                    
                    // បើនៅតែ Error 409 មានន័យថា Email នេះធ្លាប់ Register ជាមួយ Password ធម្មតា (Manual) បាត់ហើយ
                    if (regErr.status === 409 || msg.toLowerCase().includes('email')) {
                        toast.warning(`អ៊ីមែលនេះមានរួចហើយជាមួយ Password ផ្សេង។ សូមប្រើអ៊ីមែលផ្សេង ឬ Login ធម្មតា។`);
                    } else {
                        toast.error(msg || `មានបញ្ហាបច្ចេកទេសជាមួយ ${providerName}`);
                    }
                    setLoading('');
                    return false;
                }
            } else {
                toast.error(err?.data?.message || `ការភ្ជាប់ទៅកាន់ Server បរាជ័យ`);
                setLoading('');
                return false;
            }
        }
    };

    return { syncOAuthUser, oauthLoading: loading };
}