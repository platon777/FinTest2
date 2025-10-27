
import React, { useState } from 'react';
import { mockUser } from '../data/mock';
import { User } from '../types';
import Card from '../components/Card';

const InfoRow: React.FC<{ label: string, value: string | undefined }> = ({ label, value }) => (
    <div className="grid grid-cols-3 gap-4 py-2">
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="text-sm text-gray-900 col-span-2">{value || 'N/A'}</dd>
    </div>
);

const ProfilePage: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [user, setUser] = useState<User>(mockUser);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const nameParts = name.split('.');

        if(nameParts.length > 1) {
            setUser(prevUser => ({
                ...prevUser,
                [nameParts[0]]: {
                    ...prevUser.investorProfile,
                    [nameParts[1]]: value,
                }
            } as User));
        } else {
             setUser(prevUser => ({
                ...prevUser,
                [name]: value,
            }));
        }
    }

    const handleSave = () => {
        // Here you would call an API to save the user data
        console.log("Saving user data:", user);
        setIsEditing(false);
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Profil et KYC</h1>
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="bg-blue-800 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                        Modifier
                    </button>
                ) : (
                    <div className="space-x-2">
                        <button onClick={() => { setIsEditing(false); setUser(mockUser); }} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md hover:bg-gray-300 transition-colors">
                            Annuler
                        </button>
                        <button onClick={handleSave} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-500 transition-colors">
                            Enregistrer
                        </button>
                    </div>
                )}
            </div>

            <Card title="Informations personnelles">
                <dl className="divide-y divide-gray-200">
                    <InfoRow label="Nom complet" value={user.name} />
                    <InfoRow label="Type de client" value={user.clientType} />
                    <InfoRow label="Adresse email" value={user.email} />
                    {isEditing ? (
                        <div className="grid grid-cols-3 gap-4 py-2">
                            <label className="text-sm font-medium text-gray-500 pt-2">Numéro de téléphone</label>
                            <input type="text" name="phone" value={user.phone} onChange={handleInputChange} className="col-span-2 p-1 border rounded-md" />
                        </div>
                    ) : (
                        <InfoRow label="Numéro de téléphone" value={user.phone} />
                    )}
                    {isEditing ? (
                        <div className="grid grid-cols-3 gap-4 py-2">
                            <label className="text-sm font-medium text-gray-500 pt-2">Adresse</label>
                            <input type="text" name="address" value={user.address} onChange={handleInputChange} className="col-span-2 p-1 border rounded-md" />
                        </div>
                    ) : (
                         <InfoRow label="Adresse" value={user.address} />
                    )}
                </dl>
            </Card>

            <Card title="Profil investisseur">
                <dl className="divide-y divide-gray-200">
                    <InfoRow label="Statut" value={user.investorProfile.type} />
                    {isEditing ? (
                         <div className="grid grid-cols-3 gap-4 py-2">
                            <label className="text-sm font-medium text-gray-500 pt-2">Niveau de risque</label>
                            <select name="investorProfile.riskLevel" value={user.investorProfile.riskLevel} onChange={handleInputChange} className="col-span-2 p-1 border rounded-md">
                                <option value="Faible">Faible</option>
                                <option value="Modéré">Modéré</option>
                                <option value="Élevé">Élevé</option>
                            </select>
                        </div>
                    ) : (
                        <InfoRow label="Niveau de risque accepté" value={user.investorProfile.riskLevel} />
                    )}
                    {isEditing ? (
                        <div className="grid grid-cols-3 gap-4 py-2">
                            <label className="text-sm font-medium text-gray-500 pt-2">Horizon d'investissement</label>
                            <select name="investorProfile.investmentHorizon" value={user.investorProfile.investmentHorizon} onChange={handleInputChange} className="col-span-2 p-1 border rounded-md">
                                <option value="Court terme">Court terme</option>
                                <option value="Moyen terme">Moyen terme</option>
                                <option value="Long terme">Long terme</option>
                            </select>
                        </div>
                    ) : (
                        <InfoRow label="Horizon d'investissement" value={user.investorProfile.investmentHorizon} />
                    )}
                     <InfoRow label="Revenu annuel" value={user.investorProfile.annualIncome} />
                </dl>
            </Card>
        </div>
    );
};

export default ProfilePage;
