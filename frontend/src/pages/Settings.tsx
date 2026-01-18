import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { useTheme } from '../context/ThemeContext';
import { User, Bell, Shield, Moon, Sun } from 'lucide-react';

export function Settings() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Manage your account and system preferences.</p>
            </div>

            {/* User Profile */}
            <Card className="dark:bg-slate-900 dark:border-slate-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-white">
                        <User className="w-5 h-5" />
                        User Profile
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                            <User className="w-8 h-8 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">Officer John Doe</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Badge ID: 894421</p>
                            <Badge variant="secondary" className="mt-1">Detective - Station 4</Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium dark:text-slate-200">Full Name</label>
                            <Input defaultValue="John Doe" className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium dark:text-slate-200">Badge Number</label>
                            <Input defaultValue="894421" readOnly className="bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium dark:text-slate-200">Email</label>
                        <Input type="email" defaultValue="j.doe@police.gov" className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                    </div>
                </CardContent>
            </Card>

            {/* Appearance */}
            <Card className="dark:bg-slate-900 dark:border-slate-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-white">
                        {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        Appearance
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium dark:text-slate-200">Theme</label>
                        <Select
                            value={theme}
                            onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                            options={[
                                { label: 'Light Mode', value: 'light' },
                                { label: 'Dark Mode', value: 'dark' },
                            ]}
                            className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400">Choose your preferred color theme for the interface.</p>
                    </div>
                </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="dark:bg-slate-900 dark:border-slate-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-white">
                        <Bell className="w-5 h-5" />
                        Notifications
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b dark:border-slate-800">
                        <div>
                            <p className="font-medium dark:text-white">Evidence Alerts</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Get notified when evidence is flagged</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-5 h-5" />
                    </div>
                    <div className="flex items-center justify-between py-3 border-b dark:border-slate-800">
                        <div>
                            <p className="font-medium dark:text-white">Custody Breaches</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Immediate alerts for chain of custody issues</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-5 h-5" />
                    </div>
                    <div className="flex items-center justify-between py-3">
                        <div>
                            <p className="font-medium dark:text-white">System Updates</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Blockchain network status changes</p>
                        </div>
                        <input type="checkbox" className="w-5 h-5" />
                    </div>
                </CardContent>
            </Card>

            {/* Security */}
            <Card className="dark:bg-slate-900 dark:border-slate-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-white">
                        <Shield className="w-5 h-5" />
                        Security
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium dark:text-slate-200">API Key</label>
                        <div className="flex gap-2">
                            <Input readOnly value="sk_live_••••••••••••••••••••••••4Qz8" className="bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 font-mono text-xs" />
                            <Button variant="outline" className="dark:border-slate-700 dark:text-slate-300">Regenerate</Button>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Used for blockchain transactions and evidence verification.</p>
                    </div>

                    <Button variant="destructive" className="w-full">Change Password</Button>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
                <Button variant="outline" className="dark:border-slate-700 dark:text-slate-300">Cancel</Button>
                <Button>Save Changes</Button>
            </div>
        </div>
    );
}
