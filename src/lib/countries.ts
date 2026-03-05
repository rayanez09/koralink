export const AFRICAN_COUNTRIES = [
    { code: 'ci', name: 'Côte d\'Ivoire', currency: 'XOF', flag: '🇨🇮' },
    { code: 'sn', name: 'Sénégal', currency: 'XOF', flag: '🇸🇳' },
    { code: 'ml', name: 'Mali', currency: 'XOF', flag: '🇲🇱' },
    { code: 'bf', name: 'Burkina Faso', currency: 'XOF', flag: '🇧🇫' },
    { code: 'ne', name: 'Niger', currency: 'XOF', flag: '🇳🇪' },
    { code: 'tg', name: 'Togo', currency: 'XOF', flag: '🇹🇬' },
    { code: 'bj', name: 'Bénin', currency: 'XOF', flag: '🇧🇯' },
    { code: 'gw', name: 'Guinée-Bissau', currency: 'XOF', flag: '🇬🇼' },
    { code: 'cm', name: 'Cameroun', currency: 'XAF', flag: '🇨🇲' },
    { code: 'ga', name: 'Gabon', currency: 'XAF', flag: '🇬🇦' },
    { code: 'cg', name: 'Congo', currency: 'XAF', flag: '🇨🇬' },
    { code: 'td', name: 'Tchad', currency: 'XAF', flag: '🇹🇩' },
    { code: 'cf', name: 'RCA', currency: 'XAF', flag: '🇨🇫' },
    { code: 'gq', name: 'Guinée Équatoriale', currency: 'XAF', flag: '🇬🇶' },
    { code: 'cd', name: 'RDC', currency: 'CDF', flag: '🇨🇩' },
    { code: 'gh', name: 'Ghana', currency: 'GHS', flag: '🇬🇭' },
    { code: 'ng', name: 'Nigéria', currency: 'NGN', flag: '🇳🇬' },
    { code: 'ke', name: 'Kenya', currency: 'KES', flag: '🇰🇪' },
    { code: 'ug', name: 'Ouganda', currency: 'UGX', flag: '🇺🇬' },
    { code: 'rw', name: 'Rwanda', currency: 'RWF', flag: '🇷🇼' },
    { code: 'tz', name: 'Tanzanie', currency: 'TZS', flag: '🇹🇿' },
    { code: 'zm', name: 'Zambie', currency: 'ZMW', flag: '🇿🇲' },
    { code: 'mw', name: 'Malawi', currency: 'MWK', flag: '🇲🇼' },
    { code: 'za', name: 'Afrique du Sud', currency: 'ZAR', flag: '🇿🇦' },
]

export const countryPrefixes: Record<string, string> = {
    'sn': '+221', 'ci': '+225', 'gh': '+233', 'ml': '+223', 'bf': '+226',
    'ne': '+227', 'tg': '+228', 'bj': '+229', 'gw': '+245', 'cm': '+237',
    'ga': '+241', 'cg': '+242', 'td': '+235', 'cd': '+243', 'ng': '+234',
    'ke': '+254', 'ug': '+256', 'rw': '+250', 'cf': '+236', 'gq': '+240',
    'tz': '+255', 'zm': '+260', 'mw': '+265', 'za': '+27'
}

export const countryPlaceholders: Record<string, string> = {
    'ci': '01 02 03 04 05',
    'sn': '77 123 45 67',
    'ml': '70 12 34 56',
    'bf': '70 12 34 56',
    'ne': '90 12 34 56',
    'tg': '90 12 34 56',
    'bj': '97 12 34 56',
    'gw': '95 123 45 67',
    'cm': '6 71 23 45 67',
    'ga': '77 12 34 56',
    'cg': '6 123 45 67',
    'td': '66 12 34 56',
    'cf': '70 12 34 56',
    'gq': '222 12 34 56',
    'cd': '81 123 45 67',
    'gh': '24 123 4567',
    'ng': '80 1234 5678',
    'ke': '712 345 678',
    'ug': '772 123 456',
    'rw': '78 123 45 67',
    'tz': '712 345 678',
    'zm': '97 123 4567',
    'mw': '88 123 4567',
    'za': '81 123 4567',
}
export const countryPayoutMethods: Record<string, { id: string, name: string }[]> = {
    'ci': [
        { id: 'orange_ci', name: 'Orange Money' },
        { id: 'mtn_ci', name: 'MTN Mobile Money' },
        { id: 'moov_ci', name: 'Moov Africa' },
        { id: 'wave_ci', name: 'Wave' },
        { id: 'djamo_ci', name: 'Djamo' }
    ],
    'sn': [
        { id: 'orange_sn', name: 'Orange Money' },
        { id: 'wave_sn', name: 'Wave' },
        { id: 'freemoney_sn', name: 'Free Money' },
        { id: 'djamo_sn', name: 'Djamo' },
        { id: 'e_money_sn', name: 'E-Money' }
    ],
    'ml': [
        { id: 'orange_ml', name: 'Orange Money' },
        { id: 'moov_ml', name: 'Moov Africa' }
    ],
    'bf': [
        { id: 'orange_bf', name: 'Orange Money' },
        { id: 'moov_bf', name: 'Moov Africa' }
    ],
    'ne': [
        { id: 'airtel_ne', name: 'Airtel Money' },
        { id: 'moov_ne', name: 'Moov Africa' },
    ],
    'tg': [
        { id: 'togocel_tg', name: 'TMoney' },
        { id: 'moov_tg', name: 'Moov Africa' }
    ],
    'bj': [
        { id: 'mtn_bj', name: 'MTN Mobile Money' },
        { id: 'moov_bj', name: 'Moov Africa' }
    ],
    'gw': [
        { id: 'orange_gw', name: 'Orange Money' }
    ],
    'cm': [
        { id: 'mtn_cm', name: 'MTN Mobile Money' },
        { id: 'orange_cm', name: 'Orange Money' },
        { id: 'eu_mobile_cm', name: 'EU Mobile Money' }
    ],
    'ga': [
        { id: 'airtel_ga', name: 'Airtel Money' },
        { id: 'moov_ga', name: 'Moov Africa' }
    ],
    'cg': [
        { id: 'airtel_cg', name: 'Airtel Money' },
        { id: 'mtn_cg', name: 'MTN Mobile Money' }
    ],
    'td': [
        { id: 'airtel_td', name: 'Airtel Money' },
        { id: 'moov_td', name: 'Moov Africa' }
    ],
    'cf': [
        { id: 'orange_cf', name: 'Orange Money' }
    ],
    'gq': [
        { id: 'mtn_gq', name: 'MTN Mobile Money' }
    ],
    'cd': [
        { id: 'airtel_cd', name: 'Airtel Money' },
        { id: 'orange_cd', name: 'Orange Money' },
        { id: 'vodacom_cd', name: 'Vodacom' }
    ],
    'gh': [
        { id: 'mtn_gh', name: 'MTN Mobile Money' },
        { id: 'vodafone_gh', name: 'Vodafone Cash' },
        { id: 'tigo_gh', name: 'AirtelTigo' }
    ],
    'ng': [
        { id: 'mtn_ng', name: 'MTN Nigeria' },
        { id: 'airtel_ng', name: 'Airtel Money' }
    ],
    'ke': [
        { id: 'mpesa_ke', name: 'M-Pesa' },
        { id: 'airtel_ke', name: 'Airtel Money' }
    ],
    'ug': [
        { id: 'airtel_ug', name: 'Airtel Money' },
        { id: 'mtn_ug', name: 'MTN Mobile Money' }
    ],
    'rw': [
        { id: 'mtn_rw', name: 'MTN Mobile Money' },
        { id: 'airtel_rw', name: 'Airtel Money' }
    ],
    'tz': [
        { id: 'mpesa_tz', name: 'M-Pesa' },
        { id: 'airtel_tz', name: 'Airtel Money' },
        { id: 'tigo_tz', name: 'Tigo Pesa' },
        { id: 'halopesa_tz', name: 'HaloPesa' }
    ],
    'zm': [
        { id: 'airtel_zm', name: 'Airtel Money' },
        { id: 'mtn_zm', name: 'MTN Mobile Money' }
    ],
    'mw': [
        { id: 'airtel_mw', name: 'Airtel Money' },
        { id: 'tnm_mw', name: 'TNM Mpamba' }
    ],
    'za': [
        { id: 'bank_transfer', name: 'Virement Bancaire' }
    ]
}
