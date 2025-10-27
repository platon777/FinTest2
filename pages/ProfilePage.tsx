import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User } from '../types';
import Card from '../components/Card';

const InfoRow: React.FC<{ label: string, value: string | undefined }> = ({ label, value }) => (
    <div className="flex justify-between items-center py-4 border-b border-gray-200 last:border-b-0">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-900 text-right">{value || 'N/A'}</p>
    </div>
);

const EditRow: React.FC<{ label: string, children: React.ReactNode }> = ({ label, children }) => (
    <div className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
        <label className="text-sm text-gray-500">{label}</label>
        <div className="w-1/2 flex justify-end">
            {children}
        </div>
    </div>
);

const SkeletonInfoCard: React.FC = () => (
    <Card>
        <div className="space-y-4 animate-pulse">
            {[...Array(5)].map((_, i) => (
                 <div key={i} className="flex justify-between items-center py-4 border-b border-gray-200 last:border-b-0">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
            ))}
        </div>
    </Card>
);


const ProfilePage: React.FC = () => {
    const { displayedUser, isLoadingData } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [user, setUser] = useState<User | null>(displayedUser);

    useEffect(() => {
        setUser(displayedUser);
        setIsEditing(false); // Exit edit mode on account switch
    }, [displayedUser]);
    
    if (!user) {
        return (
            <div className="space-y-8 max-w-4xl mx-auto">
                <div className="h-10 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                <SkeletonInfoCard />
                <SkeletonInfoCard />
            </div>
        );
    }
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const nameParts = name.split('.');

        setUser(prevUser => {
            if (!prevUser) return null;
            if (nameParts.length > 1 && nameParts[0] === 'investorProfile') {
                const key = nameParts[1] as keyof User['investorProfile'];
                return {
                    ...prevUser,
                    investorProfile: {
                        ...prevUser.investorProfile,
                        [key]: value,
                    },
                };
            } else {
                const key = name as keyof User;
                return {
                    ...prevUser,
                    [key]: value,
                };
            }
        });
    }

    const handleSave = () => {
        // In a real application, you would call an API to save the user data.
        console.log("Saving user data for account:", user.id, user);
        setIsEditing(false);
        // Here you might want to refetch the context data or update it optimistically
    }

    const handleCancel = () => {
        setIsEditing(false);
        setUser(displayedUser); // Reset changes to the original data from context
    }

    const inputClasses = "w-full p-2 border border-gray-300 rounded-md text-sm text-right focus:ring-blue-500 focus:border-blue-500";
    const selectClasses = inputClasses;

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-gray-900">Profil et KYC</h1>
                {!isEditing ? (
                    <button 
                        onClick={() => setIsEditing(true)} 
                        className="bg-blue-800 text-white font-semibold py-2 px-6 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                        aria-label="Modifier le profil"
                    >
                        Modifier
                    </button>
                ) : (
                    <div className="flex items-center space-x-3">
                        <button onClick={handleCancel} className="bg-white text-gray-800 font-semibold py-2 px-4 rounded-md hover:bg-gray-100 transition-colors border border-gray-300">
                            Annuler
                        </button>
                        <button onClick={handleSave} className="bg-blue-800 text-white font-semibold py-2 px-6 rounded-md hover:bg-blue-700 transition-colors shadow-sm">
                            Enregistrer
                        </button>
                    </div>
                )}
            </div>
            
            {isLoadingData ? <SkeletonInfoCard /> : (
                <Card title="Informations personnelles" titleClassName="font-bold text-lg">
                    {!isEditing ? (
                        <>
                            <InfoRow label="Nom complet" value={user.name} />
                            <InfoRow label="Type de client" value={user.clientType} />
                            <InfoRow label="Adresse email" value={user.email} />
                            <InfoRow label="Numéro de téléphone" value={user.phone} />
                            <InfoRow label="Adresse" value={user.address} />
                        </>
                    ) : (
                        <>
                            <EditRow label="Nom complet"><p className="text-sm font-semibold text-gray-900 text-right">{user.name}</p></EditRow>
                            <EditRow label="Type de client"><p className="text-sm font-semibold text-gray-900 text-right">{user.clientType}</p></EditRow>
                            <EditRow label="Adresse email"><p className="text-sm font-semibold text-gray-900 text-right">{user.email}</p></EditRow>
                            <EditRow label="Numéro de téléphone">
                                <input type="tel" name="phone" value={user.phone} onChange={handleInputChange} className={inputClasses} />
                            </EditRow>
                            <EditRow label="Adresse">
                                <input type="text" name="address" value={user.address} onChange={handleInputChange} className={inputClasses} />
                            </EditRow>
                        </>
                    )}
                </Card>
            )}

            {isLoadingData ? <SkeletonInfoCard /> : (
                <Card title="Profil investisseur" titleClassName="font-bold text-lg">
                    {!isEditing ? (
                        <>
                            <InfoRow label="Statut" value={user.investorProfile.type} />
                            <InfoRow label="Niveau de risque accepté" value={user.investorProfile.riskLevel} />
                            <InfoRow label="Horizon d'investissement" value={user.investorProfile.investmentHorizon} />
                            <InfoRow label="Revenu annuel" value={user.investorProfile.annualIncome} />
                        </>
                    ) : (
                        <>
                            <EditRow label="Statut"><p className="text-sm font-semibold text-gray-900 text-right">{user.investorProfile.type}</p></EditRow>
                            <EditRow label="Niveau de risque accepté">
                                <select name="investorProfile.riskLevel" value={user.investorProfile.riskLevel} onChange={handleInputChange} className={selectClasses}>
                                    <option value="Faible">Faible</option>
                                    <option value="Modéré">Modéré</option>
                                    <option value="Élevé">Élevé</option>
                                </select>
                            </EditRow>
                            <EditRow label="Horizon d'investissement">
                                <select name="investorProfile.investmentHorizon" value={user.investorProfile.investmentHorizon} onChange={handleInputChange} className={selectClasses}>
                                    <option value="Court terme">Court terme</option>
                                    <option value="Moyen terme">Moyen terme</option>
                                    <option value="Long terme">Long terme</option>
                                </select>
                            </EditRow>
                            <EditRow label="Revenu annuel"><p className="text-sm font-semibold text-gray-900 text-right">{user.investorProfile.annualIncome || 'N/A'}</p></EditRow>
                        </>
                    )}
                </Card>
            )}
        </div>
    );
};

export default ProfilePage;
