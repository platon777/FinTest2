-- ============================================================================
-- SCRIPT COMPLET - CRÉATION TYPES INSTRUMENTS + DONNÉES DE TEST
-- À exécuter sur Azure SQL Database
-- ============================================================================

PRINT '=================================================================';
PRINT 'DÉBUT CRÉATION COMPLÈTE DES DONNÉES';
PRINT '=================================================================';

-- ============================================================================
-- PARTIE 0 : CRÉATION DES TYPES D'INSTRUMENTS
-- ============================================================================

PRINT 'Création des types d''instruments...';

-- Vérifier et créer les types d'instruments s'ils n'existent pas
IF NOT EXISTS (SELECT 1 FROM TypesInstruments WHERE Code = 'OBL')
BEGIN
    INSERT INTO TypesInstruments (Code, Nom, Description)
    VALUES ('OBL', 'Obligation', 'Titre de créance émis par une entité publique ou privée');
    PRINT '✓ Type Obligation créé';
END

IF NOT EXISTS (SELECT 1 FROM TypesInstruments WHERE Code = 'DEPOT')
BEGIN
    INSERT INTO TypesInstruments (Code, Nom, Description)
    VALUES ('DEPOT', 'Dépôt à Terme', 'Produit d''épargne avec taux fixe et échéance définie');
    PRINT '✓ Type Dépôt à Terme créé';
END

IF NOT EXISTS (SELECT 1 FROM TypesInstruments WHERE Code = 'TRESOR')
BEGIN
    INSERT INTO TypesInstruments (Code, Nom, Description)
    VALUES ('TRESOR', 'Bon du Trésor', 'Titre de créance émis par l''État');
    PRINT '✓ Type Bon du Trésor créé';
END

PRINT '✓ Types d''instruments vérifiés/créés';

-- ============================================================================
-- PARTIE 1 : CRÉATION DES INSTRUMENTS FINANCIERS
-- ============================================================================

PRINT 'Création des instruments financiers...';

DECLARE @OBL_TypeID INT = (SELECT TypeInstrumentID FROM TypesInstruments WHERE Code = 'OBL');
DECLARE @DEPOT_TypeID INT = (SELECT TypeInstrumentID FROM TypesInstruments WHERE Code = 'DEPOT');
DECLARE @TRESOR_TypeID INT = (SELECT TypeInstrumentID FROM TypesInstruments WHERE Code = 'TRESOR');

-- Instrument 1: OBL-BRH-2025
IF NOT EXISTS (SELECT 1 FROM Instruments WHERE Code = 'OBL-BRH-2025')
BEGIN
    INSERT INTO Instruments (TypeInstrumentID, Code, Nom, Emetteur, TauxRendementAnnuel,
        DateEmission, DateMaturite, ValeurNominale, MontantMinimum, Devise, FrequencePaiementInterets, StatutInstrument)
    VALUES (@OBL_TypeID, 'OBL-BRH-2025', 'Obligation BRH 5% 2025-2030', 'Banque de la République d''Haïti',
        5.00, '2025-01-01', '2030-01-01', 1000.00, 5000.00, 'USD', 'SEMESTRIEL', 'DISPONIBLE');
    PRINT '✓ OBL-BRH-2025 créé';
END

-- Instrument 2: OBL-EDH-2025
IF NOT EXISTS (SELECT 1 FROM Instruments WHERE Code = 'OBL-EDH-2025')
BEGIN
    INSERT INTO Instruments (TypeInstrumentID, Code, Nom, Emetteur, TauxRendementAnnuel,
        DateEmission, DateMaturite, ValeurNominale, MontantMinimum, Devise, FrequencePaiementInterets, StatutInstrument)
    VALUES (@OBL_TypeID, 'OBL-EDH-2025', 'Obligation EDH 6% 2025-2028', 'Électricité d''Haïti',
        6.00, '2025-01-01', '2028-01-01', 1000.00, 10000.00, 'USD', 'TRIMESTRIEL', 'DISPONIBLE');
    PRINT '✓ OBL-EDH-2025 créé';
END

-- Instrument 3: DEPOT-12M
IF NOT EXISTS (SELECT 1 FROM Instruments WHERE Code = 'DEPOT-12M')
BEGIN
    INSERT INTO Instruments (TypeInstrumentID, Code, Nom, Emetteur, TauxRendementAnnuel,
        DateEmission, DateMaturite, ValeurNominale, MontantMinimum, Devise, FrequencePaiementInterets, StatutInstrument)
    VALUES (@DEPOT_TypeID, 'DEPOT-12M', 'Dépôt à Terme 12 mois 4.5%', 'ProFin Bank',
        4.50, '2024-01-01', '2025-01-01', 100.00, 1000.00, 'USD', 'A_MATURITE', 'DISPONIBLE');
    PRINT '✓ DEPOT-12M créé';
END

-- Instrument 4: OBL-BRH-2024-002
IF NOT EXISTS (SELECT 1 FROM Instruments WHERE Code = 'OBL-BRH-2024-002')
BEGIN
    INSERT INTO Instruments (TypeInstrumentID, Code, Nom, Emetteur, TauxRendementAnnuel,
        DateEmission, DateMaturite, ValeurNominale, MontantMinimum, Devise, FrequencePaiementInterets, StatutInstrument)
    VALUES (@OBL_TypeID, 'OBL-BRH-2024-002', 'Obligation BRH 5.5% 2024-2034', 'Banque de la République d''Haïti',
        5.50, '2024-01-15', '2034-01-15', 1000.00, 10000.00, 'USD', 'SEMESTRIEL', 'DISPONIBLE');
    PRINT '✓ OBL-BRH-2024-002 créé';
END

-- Instrument 5: OBL-SOUV-2023
IF NOT EXISTS (SELECT 1 FROM Instruments WHERE Code = 'OBL-SOUV-2023')
BEGIN
    INSERT INTO Instruments (TypeInstrumentID, Code, Nom, Emetteur, TauxRendementAnnuel,
        DateEmission, DateMaturite, ValeurNominale, MontantMinimum, Devise, FrequencePaiementInterets, StatutInstrument)
    VALUES (@OBL_TypeID, 'OBL-SOUV-2023', 'Obligation Souveraine 4.2% 2023-2028', 'République d''Haïti',
        4.20, '2023-12-01', '2028-01-01', 1000.00, 5000.00, 'USD', 'SEMESTRIEL', 'DISPONIBLE');
    PRINT '✓ OBL-SOUV-2023 créé';
END

-- Instrument 6: OBL-VERT-2024
IF NOT EXISTS (SELECT 1 FROM Instruments WHERE Code = 'OBL-VERT-2024')
BEGIN
    INSERT INTO Instruments (TypeInstrumentID, Code, Nom, Emetteur, TauxRendementAnnuel,
        DateEmission, DateMaturite, ValeurNominale, MontantMinimum, Devise, FrequencePaiementInterets, StatutInstrument)
    VALUES (@OBL_TypeID, 'OBL-VERT-2024', 'Obligation Verte Énergie 4% 2024-2027', 'Électricité d''Haïti',
        4.00, '2024-01-01', '2027-01-01', 1000.00, 3000.00, 'USD', 'TRIMESTRIEL', 'DISPONIBLE');
    PRINT '✓ OBL-VERT-2024 créé';
END

-- Instrument 7: BT-6M-2024
IF NOT EXISTS (SELECT 1 FROM Instruments WHERE Code = 'BT-6M-2024')
BEGIN
    INSERT INTO Instruments (TypeInstrumentID, Code, Nom, Emetteur, TauxRendementAnnuel,
        DateEmission, DateMaturite, ValeurNominale, MontantMinimum, Devise, FrequencePaiementInterets, StatutInstrument)
    VALUES (@TRESOR_TypeID, 'BT-6M-2024', 'Bon du Trésor 6 mois', 'Ministère des Finances',
        3.80, '2024-06-01', '2024-12-01', 100.00, 5000.00, 'USD', 'A_MATURITE', 'DISPONIBLE');
    PRINT '✓ BT-6M-2024 créé';
END

PRINT '✓ 7 instruments financiers créés';

-- ============================================================================
-- PARTIE 2 : NETTOYAGE COMPLET DE TOUTES LES DONNÉES
-- ============================================================================

PRINT 'Nettoyage COMPLET de toutes les données existantes...';

-- Supprimer TOUTES les données dans l'ordre inverse des dépendances
DELETE FROM JournalAudit;
DELETE FROM VerificationsConformite;
DELETE FROM PaiementsInterets;
DELETE FROM Transactions;
DELETE FROM Souscriptions;
DELETE FROM ComptesRoles;
DELETE FROM Comptes;
DELETE FROM ContactsClients;
DELETE FROM AdressesClients;
DELETE FROM ClientsIndividuels;
DELETE FROM ClientsInstitutionnels;
DELETE FROM ClientsAuthentification;
DELETE FROM Clients;

PRINT '✓ Nettoyage complet terminé - Toutes les tables sont vides';

-- ============================================================================
-- PARTIE 3 : CRÉATION DES CLIENTS AVEC BCRYPT
-- ============================================================================

PRINT 'Création des clients avec mots de passe hashés (bcrypt)...';

-- Variables pour les IDs
DECLARE @MarceusCID INT, @PatrickCID INT, @JosephCID INT, @AlexandraCID INT;
DECLARE @HotelOasisCID INT, @MarieCID INT, @SophiaCID INT;

-- CLIENT 1 : Marceus Jethro
INSERT INTO Clients (ClientType, ProfilRisque, StatutClient)
VALUES ('INDIVIDUEL', 'MODERE', 'ACTIF');
SET @MarceusCID = SCOPE_IDENTITY();

INSERT INTO ClientsIndividuels (ClientID, Prenom, Nom, DateNaissance, LieuNaissance, Nationalite,
    TypePieceIdentite, NumeroPieceIdentite, DateExpirationPiece, SituationMatrimoniale,
    Profession, SourceRevenus, RevenuAnnuelEstime)
VALUES (@MarceusCID, 'Marceus', 'Jethro', '1985-03-15', 'Port-au-Prince', 'Haïtienne',
    'CIN', 'CIN-001-2020-12345', '2030-03-15', 'Marié',
    'Entrepreneur', 'Commerce et Investissements', 85000.00);

INSERT INTO AdressesClients (ClientID, TypeAdresse, AdresseLigne1, Ville, CodePostal, Pays, EstPrincipale)
VALUES (@MarceusCID, 'DOMICILE', '45 Rue Grégoire, Pétion-Ville', 'Port-au-Prince', 'HT6140', 'Haïti', 1);

INSERT INTO ContactsClients (ClientID, TypeContact, Valeur, EstPrincipal, EstVerifie)
VALUES
    (@MarceusCID, 'EMAIL', 'marceus.jethro@email.ht', 1, 1),
    (@MarceusCID, 'MOBILE', '+509 3812 5678', 1, 1);

INSERT INTO ClientsAuthentification (ClientID, Email, PasswordHash, EstActif)
VALUES (@MarceusCID, 'marceus.jethro@email.ht', '$2b$12$CW2WqHi77Qw0aFgvRde60OtTaMDy.FQZp.ByvlL2avl.XO7zLES.K', 1);

PRINT '✓ Marceus Jethro créé (password: motdepasse123)';

-- CLIENT 2 : Patrick Marcellus
INSERT INTO Clients (ClientType, ProfilRisque, StatutClient)
VALUES ('INDIVIDUEL', 'AGRESSIF', 'ACTIF');
SET @PatrickCID = SCOPE_IDENTITY();

INSERT INTO ClientsIndividuels (ClientID, Prenom, Nom, DateNaissance, LieuNaissance, Nationalite,
    TypePieceIdentite, NumeroPieceIdentite, DateExpirationPiece, SituationMatrimoniale,
    Profession, SourceRevenus, RevenuAnnuelEstime)
VALUES (@PatrickCID, 'Patrick', 'Marcellus', '1978-11-22', 'Cap-Haïtien', 'Haïtienne',
    'PASSEPORT', 'PA-HT-789456', '2028-11-22', 'Célibataire',
    'Médecin Cardiologue', 'Cabinet médical privé', 120000.00);

INSERT INTO AdressesClients (ClientID, TypeAdresse, AdresseLigne1, Ville, CodePostal, Pays, EstPrincipale)
VALUES (@PatrickCID, 'DOMICILE', '78 Avenue Jean-Paul II, Turgeau', 'Port-au-Prince', 'HT6120', 'Haïti', 1);

INSERT INTO ContactsClients (ClientID, TypeContact, Valeur, EstPrincipal, EstVerifie)
VALUES
    (@PatrickCID, 'EMAIL', 'dr.patrick.marcellus@clinic.ht', 1, 1),
    (@PatrickCID, 'MOBILE', '+509 3745 9012', 1, 1);

INSERT INTO ClientsAuthentification (ClientID, Email, PasswordHash, EstActif)
VALUES (@PatrickCID, 'dr.patrick.marcellus@clinic.ht', '$2b$12$IMhdV.sKvgotxzMfKMxq.eixESRO7tWcaBWlEKPx51i6k0Ba8B222', 1);

PRINT '✓ Patrick Marcellus créé (password: motdepasse123)';

-- CLIENT 3 : Joseph Woldy
INSERT INTO Clients (ClientType, ProfilRisque, StatutClient)
VALUES ('INDIVIDUEL', 'CONSERVATEUR', 'ACTIF');
SET @JosephCID = SCOPE_IDENTITY();

INSERT INTO ClientsIndividuels (ClientID, Prenom, Nom, DateNaissance, LieuNaissance, Nationalite,
    TypePieceIdentite, NumeroPieceIdentite, DateExpirationPiece, SituationMatrimoniale,
    Profession, SourceRevenus, RevenuAnnuelEstime)
VALUES (@JosephCID, 'Joseph', 'Woldy', '1965-07-08', 'Jacmel', 'Haïtienne',
    'CIN', 'CIN-002-2019-67890', '2029-07-08', 'Marié',
    'Professeur Universitaire', 'Salaire et consulting', 65000.00);

INSERT INTO AdressesClients (ClientID, TypeAdresse, AdresseLigne1, Ville, CodePostal, Pays, EstPrincipale)
VALUES (@JosephCID, 'DOMICILE', '12 Impasse Borno, Bourdon', 'Port-au-Prince', 'HT6110', 'Haïti', 1);

INSERT INTO ContactsClients (ClientID, TypeContact, Valeur, EstPrincipal, EstVerifie)
VALUES
    (@JosephCID, 'EMAIL', 'joseph.woldy@university.edu.ht', 1, 1),
    (@JosephCID, 'TELEPHONE', '+509 2234 5678', 1, 1);

INSERT INTO ClientsAuthentification (ClientID, Email, PasswordHash, EstActif)
VALUES (@JosephCID, 'joseph.woldy@university.edu.ht', '$2b$12$yhVx9tuNDiTATq7VFmtLVOYjP3wtIQR87LM.7ov.WvE0lhxesTFfK', 1);

PRINT '✓ Joseph Woldy créé (password: motdepasse123)';

-- CLIENT 4 : Alexandra Dorcean
INSERT INTO Clients (ClientType, ProfilRisque, StatutClient)
VALUES ('INDIVIDUEL', 'MODERE', 'ACTIF');
SET @AlexandraCID = SCOPE_IDENTITY();

INSERT INTO ClientsIndividuels (ClientID, Prenom, Nom, DateNaissance, LieuNaissance, Nationalite,
    TypePieceIdentite, NumeroPieceIdentite, DateExpirationPiece, SituationMatrimoniale,
    Profession, SourceRevenus, RevenuAnnuelEstime)
VALUES (@AlexandraCID, 'Alexandra', 'Dorcean', '1990-05-12', 'Port-au-Prince', 'Haïtienne',
    'CIN', 'CIN-003-2021-11223', '2031-05-12', 'Célibataire',
    'Architecte', 'Cabinet d''architecture', 75000.00);

INSERT INTO AdressesClients (ClientID, TypeAdresse, AdresseLigne1, Ville, CodePostal, Pays, EstPrincipale)
VALUES (@AlexandraCID, 'DOMICILE', '89 Rue Lamarre, Pacot', 'Port-au-Prince', 'HT6130', 'Haïti', 1);

INSERT INTO ContactsClients (ClientID, TypeContact, Valeur, EstPrincipal, EstVerifie)
VALUES
    (@AlexandraCID, 'EMAIL', 'alexandra.dorcean@archidesign.ht', 1, 1),
    (@AlexandraCID, 'MOBILE', '+509 3698 4521', 1, 1);

INSERT INTO ClientsAuthentification (ClientID, Email, PasswordHash, EstActif)
VALUES (@AlexandraCID, 'alexandra.dorcean@archidesign.ht', '$2b$12$3h4hsI6oDlK2xidgj.ZvZueD6I5vVzFxNPB/BVs0r36VBIrzp3pra', 1);

PRINT '✓ Alexandra Dorcean créée (password: motdepasse123)';

-- CLIENT 5 : Hotel Oasis SARL
INSERT INTO Clients (ClientType, ProfilRisque, StatutClient)
VALUES ('INSTITUTIONNEL', 'MODERE', 'ACTIF');
SET @HotelOasisCID = SCOPE_IDENTITY();

INSERT INTO ClientsInstitutionnels (ClientID, NomEntreprise, NumeroRegistreCommerce,
    FormeJuridique, Secteur, DateCreationEntreprise, ChiffreAffairesAnnuel,
    NomRepresentantLegal, FonctionRepresentant)
VALUES (@HotelOasisCID, 'Hotel Oasis SARL', 'RC-HT-2015-004567',
    'SARL', 'Hôtellerie et Tourisme', '2015-03-20', 2500000.00,
    'Marceus Jethro', 'Directeur Général');

INSERT INTO AdressesClients (ClientID, TypeAdresse, AdresseLigne1, Ville, CodePostal, Pays, EstPrincipale)
VALUES (@HotelOasisCID, 'PROFESSIONNELLE', '156 Route de Delmas, Delmas 31', 'Port-au-Prince', 'HT6140', 'Haïti', 1);

INSERT INTO ContactsClients (ClientID, TypeContact, Valeur, EstPrincipal, EstVerifie)
VALUES
    (@HotelOasisCID, 'EMAIL', 'contact@hoteloasis.ht', 1, 1),
    (@HotelOasisCID, 'TELEPHONE', '+509 2944 5566', 1, 1);

INSERT INTO ClientsAuthentification (ClientID, Email, PasswordHash, EstActif)
VALUES (@HotelOasisCID, 'contact@hoteloasis.ht', '$2b$12$IMhdV.sKvgotxzMfKMxq.eixESRO7tWcaBWlEKPx51i6k0Ba8B222', 1);

PRINT '✓ Hotel Oasis SARL créé (password: motdepasse123)';

-- CLIENT 6 : Marie Jethro
INSERT INTO Clients (ClientType, ProfilRisque, StatutClient)
VALUES ('INDIVIDUEL', 'CONSERVATEUR', 'ACTIF');
SET @MarieCID = SCOPE_IDENTITY();

INSERT INTO ClientsIndividuels (ClientID, Prenom, Nom, DateNaissance, LieuNaissance, Nationalite,
    TypePieceIdentite, NumeroPieceIdentite, DateExpirationPiece, SituationMatrimoniale,
    Profession, SourceRevenus, RevenuAnnuelEstime)
VALUES (@MarieCID, 'Marie', 'Jethro', '1987-09-20', 'Port-au-Prince', 'Haïtienne',
    'CIN', 'CIN-004-2020-33445', '2030-09-20', 'Mariée',
    'Designer d''intérieur', 'Projets de décoration', 55000.00);

INSERT INTO AdressesClients (ClientID, TypeAdresse, AdresseLigne1, Ville, CodePostal, Pays, EstPrincipale)
VALUES (@MarieCID, 'DOMICILE', '45 Rue Grégoire, Pétion-Ville', 'Port-au-Prince', 'HT6140', 'Haïti', 1);

INSERT INTO ContactsClients (ClientID, TypeContact, Valeur, EstPrincipal, EstVerifie)
VALUES
    (@MarieCID, 'EMAIL', 'marie.jethro@designs.ht', 1, 1),
    (@MarieCID, 'MOBILE', '+509 3823 7890', 1, 1);

INSERT INTO ClientsAuthentification (ClientID, Email, PasswordHash, EstActif)
VALUES (@MarieCID, 'marie.jethro@designs.ht', '$2b$12$IMhdV.sKvgotxzMfKMxq.eixESRO7tWcaBWlEKPx51i6k0Ba8B222', 1);

PRINT '✓ Marie Jethro créée (password: motdepasse123)';

-- CLIENT 7 : Sophia Marcellus
INSERT INTO Clients (ClientType, ProfilRisque, StatutClient)
VALUES ('INDIVIDUEL', 'CONSERVATEUR', 'ACTIF');
SET @SophiaCID = SCOPE_IDENTITY();

INSERT INTO ClientsIndividuels (ClientID, Prenom, Nom, DateNaissance, LieuNaissance, Nationalite,
    TypePieceIdentite, NumeroPieceIdentite, DateExpirationPiece, SituationMatrimoniale,
    Profession, SourceRevenus, RevenuAnnuelEstime)
VALUES (@SophiaCID, 'Sophia', 'Marcellus', '2010-04-15', 'Port-au-Prince', 'Haïtienne',
    'ACTE_NAISSANCE', 'AN-2010-04-567', NULL, 'Célibataire',
    'Étudiante', 'Allocation parentale', 0.00);

INSERT INTO AdressesClients (ClientID, TypeAdresse, AdresseLigne1, Ville, CodePostal, Pays, EstPrincipale)
VALUES (@SophiaCID, 'DOMICILE', '78 Avenue Jean-Paul II, Turgeau', 'Port-au-Prince', 'HT6120', 'Haïti', 1);

INSERT INTO ContactsClients (ClientID, TypeContact, Valeur, EstPrincipal, EstVerifie)
VALUES (@SophiaCID, 'EMAIL', 'sophia.marcellus@student.ht', 1, 0);

PRINT '✓ Sophia Marcellus créée';
PRINT '✓ 7 clients créés avec vrais hashes bcrypt';

-- ============================================================================
-- PARTIE 4 : CRÉATION DES COMPTES
-- ============================================================================

PRINT 'Création des comptes...';

DECLARE @MarceusCptID INT, @PatrickCptID INT, @JosephCptID INT, @AlexandraCptID INT;
DECLARE @HotelCptID INT, @MarieCptID INT, @SophiaCptID INT, @CoupleJointCptID INT;

-- COMPTE 1 : Marceus
INSERT INTO Comptes (NumeroCompte, TypeCompte, Devise, Solde, SoldeDisponible, StatutCompte)
VALUES ('INV-2023-230001', 'INVESTISSEMENT', 'USD', 52600.00, 2600.00, 'ACTIF');
SET @MarceusCptID = SCOPE_IDENTITY();

INSERT INTO ComptesRoles (CompteID, ClientID, Role, EstActif)
VALUES (@MarceusCptID, @MarceusCID, 'TITULAIRE_PRINCIPAL', 1);

-- COMPTE 2 : Patrick
INSERT INTO Comptes (NumeroCompte, TypeCompte, Devise, Solde, SoldeDisponible, StatutCompte)
VALUES ('INV-2023-230002', 'INVESTISSEMENT', 'USD', 135000.00, 5000.00, 'ACTIF');
SET @PatrickCptID = SCOPE_IDENTITY();

INSERT INTO ComptesRoles (CompteID, ClientID, Role, EstActif)
VALUES (@PatrickCptID, @PatrickCID, 'TITULAIRE_PRINCIPAL', 1);

-- COMPTE 3 : Joseph
INSERT INTO Comptes (NumeroCompte, TypeCompte, Devise, Solde, SoldeDisponible, StatutCompte)
VALUES ('INV-2023-230003', 'INVESTISSEMENT', 'USD', 45000.00, 5000.00, 'ACTIF');
SET @JosephCptID = SCOPE_IDENTITY();

INSERT INTO ComptesRoles (CompteID, ClientID, Role, EstActif)
VALUES (@JosephCptID, @JosephCID, 'TITULAIRE_PRINCIPAL', 1);

-- COMPTE 4 : Alexandra
INSERT INTO Comptes (NumeroCompte, TypeCompte, Devise, Solde, SoldeDisponible, StatutCompte)
VALUES ('INV-2023-230004', 'INVESTISSEMENT', 'USD', 62500.00, 12500.00, 'ACTIF');
SET @AlexandraCptID = SCOPE_IDENTITY();

INSERT INTO ComptesRoles (CompteID, ClientID, Role, EstActif)
VALUES (@AlexandraCptID, @AlexandraCID, 'TITULAIRE_PRINCIPAL', 1);

-- COMPTE 5 : Hotel Oasis
INSERT INTO Comptes (NumeroCompte, TypeCompte, Devise, Solde, SoldeDisponible, StatutCompte)
VALUES ('INV-2023-230005', 'INVESTISSEMENT', 'USD', 455000.00, 5000.00, 'ACTIF');
SET @HotelCptID = SCOPE_IDENTITY();

INSERT INTO ComptesRoles (CompteID, ClientID, Role, EstActif)
VALUES
    (@HotelCptID, @HotelOasisCID, 'TITULAIRE_PRINCIPAL', 1),
    (@HotelCptID, @MarceusCID, 'ADMINISTRATEUR', 1);

-- COMPTE 6 : Marie
INSERT INTO Comptes (NumeroCompte, TypeCompte, Devise, Solde, SoldeDisponible, StatutCompte)
VALUES ('SVG-2023-230006', 'EPARGNE', 'HTG', 250000.00, 250000.00, 'ACTIF');
SET @MarieCptID = SCOPE_IDENTITY();

INSERT INTO ComptesRoles (CompteID, ClientID, Role, EstActif)
VALUES (@MarieCptID, @MarieCID, 'TITULAIRE_PRINCIPAL', 1);

-- COMPTE 7 : Compte Joint Marceus & Marie
INSERT INTO Comptes (NumeroCompte, TypeCompte, Devise, Solde, SoldeDisponible, StatutCompte)
VALUES ('INV-2024-240001', 'INVESTISSEMENT', 'USD', 180000.00, 10000.00, 'ACTIF');
SET @CoupleJointCptID = SCOPE_IDENTITY();

INSERT INTO ComptesRoles (CompteID, ClientID, Role, EstActif)
VALUES
    (@CoupleJointCptID, @MarceusCID, 'TITULAIRE_PRINCIPAL', 1),
    (@CoupleJointCptID, @MarieCID, 'TITULAIRE_SECONDAIRE', 1);

-- COMPTE 8 : Sophia
INSERT INTO Comptes (NumeroCompte, TypeCompte, Devise, Solde, SoldeDisponible, StatutCompte)
VALUES ('SVG-2023-230007', 'EPARGNE', 'USD', 15000.00, 15000.00, 'ACTIF');
SET @SophiaCptID = SCOPE_IDENTITY();

INSERT INTO ComptesRoles (CompteID, ClientID, Role, EstActif)
VALUES
    (@SophiaCptID, @SophiaCID, 'TITULAIRE_PRINCIPAL', 1),
    (@SophiaCptID, @PatrickCID, 'MANDATAIRE', 1);

-- Alexandra observatrice Hotel
INSERT INTO ComptesRoles (CompteID, ClientID, Role, EstActif)
VALUES (@HotelCptID, @AlexandraCID, 'OBSERVATEUR', 1);

PRINT '✓ 8 comptes créés avec rôles';

-- ============================================================================
-- PARTIE 5 : SOUSCRIPTIONS (Utiliser les instruments créés)
-- ============================================================================

PRINT 'Création des souscriptions...';

-- Récupération IDs instruments
DECLARE @OBL_BRH_2025_ID INT = (SELECT InstrumentID FROM Instruments WHERE Code = 'OBL-BRH-2025');
DECLARE @OBL_EDH_2025_ID INT = (SELECT InstrumentID FROM Instruments WHERE Code = 'OBL-EDH-2025');
DECLARE @DEPOT_12M_ID INT = (SELECT InstrumentID FROM Instruments WHERE Code = 'DEPOT-12M');
DECLARE @OBL_BRH_2024_ID INT = (SELECT InstrumentID FROM Instruments WHERE Code = 'OBL-BRH-2024-002');
DECLARE @OBL_SOUV_ID INT = (SELECT InstrumentID FROM Instruments WHERE Code = 'OBL-SOUV-2023');
DECLARE @OBL_VERT_ID INT = (SELECT InstrumentID FROM Instruments WHERE Code = 'OBL-VERT-2024');

-- Marceus - 2 souscriptions
INSERT INTO Souscriptions (CompteID, InstrumentID, MontantInvesti, NombreUnites, DateSouscription,
    DateMaturiteEffective, TauxSouscription, ValeurActuelle, InteretsAccumules, StatutSouscription)
VALUES
    (@MarceusCptID, @OBL_BRH_2025_ID, 20000.00, 20.000000, '2023-06-15', '2030-01-01', 5.00, 20900.00, 900.00, 'ACTIVE'),
    (@MarceusCptID, @OBL_BRH_2024_ID, 30000.00, 30.000000, '2024-02-01', '2034-01-15', 5.50, 31100.00, 1100.00, 'ACTIVE');

-- Patrick - 2 souscriptions
INSERT INTO Souscriptions (CompteID, InstrumentID, MontantInvesti, NombreUnites, DateSouscription,
    DateMaturiteEffective, TauxSouscription, ValeurActuelle, InteretsAccumules, StatutSouscription)
VALUES
    (@PatrickCptID, @OBL_BRH_2024_ID, 80000.00, 80.000000, '2024-01-20', '2034-01-15', 5.50, 83000.00, 3000.00, 'ACTIVE'),
    (@PatrickCptID, @OBL_EDH_2025_ID, 50000.00, 50.000000, '2023-08-10', '2028-01-01', 6.00, 52000.00, 2000.00, 'ACTIVE');

-- Joseph - 1 souscription
INSERT INTO Souscriptions (CompteID, InstrumentID, MontantInvesti, NombreUnites, DateSouscription,
    DateMaturiteEffective, TauxSouscription, ValeurActuelle, InteretsAccumules, StatutSouscription)
VALUES
    (@JosephCptID, @OBL_BRH_2025_ID, 40000.00, 40.000000, '2023-05-01', '2030-01-01', 5.00, 41800.00, 1800.00, 'ACTIVE');

-- Alexandra - 2 souscriptions
INSERT INTO Souscriptions (CompteID, InstrumentID, MontantInvesti, NombreUnites, DateSouscription,
    DateMaturiteEffective, TauxSouscription, ValeurActuelle, InteretsAccumules, StatutSouscription)
VALUES
    (@AlexandraCptID, @OBL_SOUV_ID, 35000.00, 35.000000, '2023-12-15', '2028-01-01', 4.20, 35500.00, 500.00, 'ACTIVE'),
    (@AlexandraCptID, @OBL_VERT_ID, 15000.00, 15.000000, '2024-01-10', '2027-01-01', 4.00, 15500.00, 500.00, 'ACTIVE');

-- Hotel Oasis - 3 grosses souscriptions
INSERT INTO Souscriptions (CompteID, InstrumentID, MontantInvesti, NombreUnites, DateSouscription,
    DateMaturiteEffective, TauxSouscription, ValeurActuelle, InteretsAccumules, StatutSouscription)
VALUES
    (@HotelCptID, @OBL_BRH_2024_ID, 200000.00, 200.000000, '2024-01-30', '2034-01-15', 5.50, 207000.00, 7000.00, 'ACTIVE'),
    (@HotelCptID, @OBL_BRH_2025_ID, 150000.00, 150.000000, '2023-07-01', '2030-01-01', 5.00, 156750.00, 6750.00, 'ACTIVE'),
    (@HotelCptID, @OBL_EDH_2025_ID, 100000.00, 100.000000, '2023-09-15', '2028-01-01', 6.00, 104250.00, 4250.00, 'ACTIVE');

-- Compte Joint - 2 souscriptions
INSERT INTO Souscriptions (CompteID, InstrumentID, MontantInvesti, NombreUnites, DateSouscription,
    DateMaturiteEffective, TauxSouscription, ValeurActuelle, InteretsAccumules, StatutSouscription)
VALUES
    (@CoupleJointCptID, @OBL_BRH_2025_ID, 100000.00, 100.000000, '2024-01-05', '2030-01-01', 5.00, 102500.00, 2500.00, 'ACTIVE'),
    (@CoupleJointCptID, @OBL_SOUV_ID, 70000.00, 70.000000, '2024-01-10', '2028-01-01', 4.20, 71500.00, 1500.00, 'ACTIVE');

-- Sophia - 1 souscription
IF @DEPOT_12M_ID IS NOT NULL
BEGIN
    INSERT INTO Souscriptions (CompteID, InstrumentID, MontantInvesti, NombreUnites, DateSouscription,
        DateMaturiteEffective, TauxSouscription, ValeurActuelle, InteretsAccumules, StatutSouscription)
    VALUES
        (@SophiaCptID, @DEPOT_12M_ID, 15000.00, 15000.000000, '2024-02-01', '2025-02-01', 4.50, 15000.00, 0.00, 'ACTIVE');
END

PRINT '✓ 13 souscriptions créées';

-- ============================================================================
-- PARTIE 6 : TRANSACTIONS
-- ============================================================================

PRINT 'Création des transactions...';

-- Transactions Marceus
INSERT INTO Transactions (TypeTransaction, CompteSource, CompteDestination, Montant, Devise,
    Description, StatutTransaction, DateCreation, DateExecution, EstAutomatique, CreePar)
VALUES
    ('DEPOT', NULL, @MarceusCptID, 5000.00, 'USD', 'Virement entrant salaire', 'EXECUTEE', '2024-07-20', '2024-07-20', 0, @MarceusCID),
    ('SOUSCRIPTION', @MarceusCptID, NULL, 20000.00, 'USD', 'Souscription OBL-BRH-2025', 'EXECUTEE', '2023-06-15', '2023-06-15', 0, @MarceusCID),
    ('RETRAIT', @MarceusCptID, NULL, 1000.00, 'USD', 'Retrait en ligne', 'EN_ATTENTE', '2024-07-25', NULL, 0, @MarceusCID);

-- Transactions Patrick
INSERT INTO Transactions (TypeTransaction, CompteSource, CompteDestination, Montant, Devise,
    Description, StatutTransaction, DateCreation, DateExecution, EstAutomatique, CreePar)
VALUES
    ('DEPOT', NULL, @PatrickCptID, 15000.00, 'USD', 'Honoraires consultation', 'EXECUTEE', '2024-06-10', '2024-06-10', 0, @PatrickCID),
    ('SOUSCRIPTION', @PatrickCptID, NULL, 80000.00, 'USD', 'Souscription OBL-BRH-2024-002', 'EXECUTEE', '2024-01-20', '2024-01-20', 0, @PatrickCID);

-- Transactions Joseph
INSERT INTO Transactions (TypeTransaction, CompteSource, CompteDestination, Montant, Devise,
    Description, StatutTransaction, DateCreation, DateExecution, EstAutomatique, CreePar)
VALUES
    ('DEPOT', NULL, @JosephCptID, 8000.00, 'USD', 'Virement salaire université', 'EXECUTEE', '2024-05-30', '2024-05-30', 0, @JosephCID),
    ('SOUSCRIPTION', @JosephCptID, NULL, 40000.00, 'USD', 'Souscription OBL-BRH-2025', 'EXECUTEE', '2023-05-01', '2023-05-01', 0, @JosephCID);

-- Transactions Alexandra
INSERT INTO Transactions (TypeTransaction, CompteSource, CompteDestination, Montant, Devise,
    Description, StatutTransaction, DateCreation, DateExecution, EstAutomatique, CreePar)
VALUES
    ('DEPOT', NULL, @AlexandraCptID, 20000.00, 'USD', 'Paiement projet architectural', 'EXECUTEE', '2024-03-15', '2024-03-15', 0, @AlexandraCID),
    ('SOUSCRIPTION', @AlexandraCptID, NULL, 35000.00, 'USD', 'Souscription OBL-SOUV-2023', 'EXECUTEE', '2023-12-15', '2023-12-15', 0, @AlexandraCID);

-- Transactions Hotel Oasis
INSERT INTO Transactions (TypeTransaction, CompteSource, CompteDestination, Montant, Devise,
    Description, StatutTransaction, DateCreation, DateExecution, EstAutomatique, CreePar)
VALUES
    ('DEPOT', NULL, @HotelCptID, 500000.00, 'USD', 'Versement capital société', 'EXECUTEE', '2023-06-01', '2023-06-01', 0, @MarceusCID),
    ('SOUSCRIPTION', @HotelCptID, NULL, 200000.00, 'USD', 'Souscription OBL-BRH-2024-002', 'EXECUTEE', '2024-01-30', '2024-01-30', 0, @MarceusCID);

-- Transactions Compte Joint
INSERT INTO Transactions (TypeTransaction, CompteSource, CompteDestination, Montant, Devise,
    Description, StatutTransaction, DateCreation, DateExecution, EstAutomatique, CreePar)
VALUES
    ('DEPOT', NULL, @CoupleJointCptID, 200000.00, 'USD', 'Dépôt commun épargne familiale', 'EXECUTEE', '2024-01-02', '2024-01-02', 0, @MarceusCID),
    ('SOUSCRIPTION', @CoupleJointCptID, NULL, 100000.00, 'USD', 'Souscription OBL-BRH-2025', 'EXECUTEE', '2024-01-05', '2024-01-05', 0, @MarceusCID);

-- Transaction Sophia
INSERT INTO Transactions (TypeTransaction, CompteSource, CompteDestination, Montant, Devise,
    Description, StatutTransaction, DateCreation, DateExecution, EstAutomatique, CreePar)
VALUES
    ('DEPOT', NULL, @SophiaCptID, 15000.00, 'USD', 'Épargne études Sophia', 'EXECUTEE', '2024-02-01', '2024-02-01', 0, @PatrickCID);

-- Paiements intérêts automatiques
INSERT INTO Transactions (TypeTransaction, CompteSource, CompteDestination, Montant, Devise,
    Description, StatutTransaction, DateCreation, DateExecution, EstAutomatique)
VALUES
    ('PAIEMENT_INTERET', NULL, @MarceusCptID, 250.00, 'USD', 'Paiement intérêts OBL-BRH-2025', 'EXECUTEE', '2024-04-01', '2024-04-01', 1),
    ('PAIEMENT_INTERET', NULL, @HotelCptID, 2750.00, 'USD', 'Paiement intérêts OBL-BRH-2025', 'EXECUTEE', '2024-04-01', '2024-04-01', 1);

PRINT '✓ 15 transactions créées';

-- ============================================================================
-- PARTIE 7 : CONFORMITÉ
-- ============================================================================

PRINT 'Création vérifications conformité...';

INSERT INTO VerificationsConformite (ClientID, TypeVerification, DateVerification, Resultat, Score, Commentaires)
VALUES
    (@MarceusCID, 'KYC', '2023-06-01', 'CONFORME', 92.50, 'Documents complets'),
    (@MarceusCID, 'AML', '2023-06-01', 'CONFORME', 88.00, 'Sources vérifiées'),
    (@PatrickCID, 'KYC', '2023-08-01', 'CONFORME', 95.00, 'Médecin enregistré'),
    (@JosephCID, 'KYC', '2023-04-20', 'CONFORME', 93.00, 'Professeur vérifié'),
    (@AlexandraCID, 'KYC', '2023-12-01', 'CONFORME', 89.50, 'Architecte indépendante'),
    (@HotelOasisCID, 'KYC', '2023-06-01', 'CONFORME', 94.00, 'Société SARL valide');

PRINT '✓ 6 vérifications conformité créées';

-- ============================================================================
-- PARTIE 8 : AUDIT
-- ============================================================================

PRINT 'Création entrées audit...';

INSERT INTO JournalAudit (ClientID, TypeAction, TableCiblee, EnregistrementID, NouvelleValeur, AdresseIP)
VALUES
    (@MarceusCID, 'LOGIN', 'ClientsAuthentification', @MarceusCID, 'Connexion réussie', '192.168.1.100'),
    (@PatrickCID, 'LOGIN', 'ClientsAuthentification', @PatrickCID, 'Connexion réussie', '192.168.1.101'),
    (@AlexandraCID, 'LOGIN', 'ClientsAuthentification', @AlexandraCID, 'Connexion réussie', '192.168.1.102');

PRINT '✓ 3 entrées audit créées';

-- ============================================================================
-- RÉCAPITULATIF
-- ============================================================================

PRINT '';
PRINT '=================================================================';
PRINT '           DONNÉES COMPLÈTES CRÉÉES AVEC SUCCÈS!';
PRINT '=================================================================';
PRINT '';
PRINT 'INFORMATIONS DE CONNEXION (Tous les mots de passe: motdepasse123)';
PRINT '=================================================================';
PRINT '';
PRINT '1. Marceus Jethro';
PRINT '   Email: marceus.jethro@email.ht';
PRINT '   Password: motdepasse123';
PRINT '';
PRINT '2. Patrick Marcellus';
PRINT '   Email: dr.patrick.marcellus@clinic.ht';
PRINT '   Password: motdepasse123';
PRINT '';
PRINT '3. Joseph Woldy';
PRINT '   Email: joseph.woldy@university.edu.ht';
PRINT '   Password: motdepasse123';
PRINT '';
PRINT '4. Alexandra Dorcean';
PRINT '   Email: alexandra.dorcean@archidesign.ht';
PRINT '   Password: motdepasse123';
PRINT '';
PRINT '5. Hotel Oasis SARL';
PRINT '   Email: contact@hoteloasis.ht';
PRINT '   Password: motdepasse123';
PRINT '';
PRINT '6. Marie Jethro';
PRINT '   Email: marie.jethro@designs.ht';
PRINT '   Password: motdepasse123';
PRINT '';
PRINT '=================================================================';
PRINT 'DONNÉES CRÉÉES:';
PRINT '=================================================================';
PRINT '  ✓ 3 types d''instruments';
PRINT '  ✓ 7 instruments financiers';
PRINT '  ✓ 7 clients (5 individuels + 1 institutionnel + 1 mineure)';
PRINT '  ✓ 8 comptes (avec rôles multiples)';
PRINT '  ✓ 13 souscriptions actives avec valeurs';
PRINT '  ✓ 15 transactions historiques';
PRINT '  ✓ 6 vérifications conformité';
PRINT '';
PRINT 'RELATIONS CLÉS:';
PRINT '  • Marceus ←→ Marie (Compte joint)';
PRINT '  • Patrick → Sophia (Mandataire)';
PRINT '  • Marceus → Hotel Oasis (Administrateur)';
PRINT '  • Alexandra → Hotel Oasis (Observateur)';
PRINT '=================================================================';
PRINT '';
PRINT 'Le dashboard devrait maintenant afficher toutes les données!';
PRINT 'Reconnectez-vous pour voir les graphiques et statistiques.';
PRINT '=================================================================';
