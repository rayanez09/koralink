export const AFRICAN_COUNTRIES = [
    { code: 'ci', name: 'Côte d\'Ivoire', currency: 'XOF' },
    { code: 'sn', name: 'Sénégal', currency: 'XOF' },
    { code: 'ml', name: 'Mali', currency: 'XOF' },
    { code: 'bf', name: 'Burkina Faso', currency: 'XOF' },
    { code: 'ne', name: 'Niger', currency: 'XOF' },
    { code: 'tg', name: 'Togo', currency: 'XOF' },
    { code: 'bj', name: 'Bénin', currency: 'XOF' },
    { code: 'gw', name: 'Guinée-Bissau', currency: 'XOF' },
    { code: 'cm', name: 'Cameroun', currency: 'XAF' },
    { code: 'ga', name: 'Gabon', currency: 'XAF' },
    { code: 'cg', name: 'Congo', currency: 'XAF' },
    { code: 'td', name: 'Tchad', currency: 'XAF' },
    { code: 'cf', name: 'RCA', currency: 'XAF' },
    { code: 'gq', name: 'Guinée Équatoriale', currency: 'XAF' },
    { code: 'cd', name: 'RDC', currency: 'CDF' },
    { code: 'gh', name: 'Ghana', currency: 'GHS' },
    { code: 'ng', name: 'Nigéria', currency: 'NGN' },
    { code: 'ke', name: 'Kenya', currency: 'KES' },
    { code: 'ug', name: 'Ouganda', currency: 'UGX' },
    { code: 'rw', name: 'Rwanda', currency: 'RWF' },
    { code: 'tz', name: 'Tanzanie', currency: 'TZS' },
    { code: 'zm', name: 'Zambie', currency: 'ZMW' },
    { code: 'mw', name: 'Malawi', currency: 'MWK' },
    { code: 'za', name: 'Afrique du Sud', currency: 'ZAR' },
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
        { id: 'orange_money', name: 'Orange Money' },
        { id: 'mtn', name: 'MTN Mobile Money' },
        { id: 'moov', name: 'Moov Africa' }
    ],
    'sn': [
        { id: 'orange_money', name: 'Orange Money' },
        { id: 'wave', name: 'Wave' },
        { id: 'free_money', name: 'Free Money' }
    ],
    'ml': [
        { id: 'orange_money', name: 'Orange Money' },
        { id: 'moov', name: 'Moov Africa' }
    ],
    'bf': [
        { id: 'orange_money', name: 'Orange Money' },
        { id: 'moov', name: 'Moov Africa' }
    ],
    'ne': [
        { id: 'airtel_money', name: 'Airtel Money' },
        { id: 'moov', name: 'Moov Africa' },
    ],
    'tg': [
        { id: 'togocel', name: 'TMoney' },
        { id: 'moov', name: 'Moov Africa' }
    ],
    'bj': [
        { id: 'mtn', name: 'MTN Mobile Money' },
        { id: 'moov', name: 'Moov Africa' },
        { id: 'celtiis', name: 'Celtiis Cash' }
    ],
    'gw': [
        { id: 'orange_money', name: 'Orange Money' }
    ],
    'cm': [
        { id: 'mtn', name: 'MTN Mobile Money' },
        { id: 'orange_money', name: 'Orange Money' }
    ],
    'ga': [
        { id: 'airtel_money', name: 'Airtel Money' },
        { id: 'moov', name: 'Moov Africa' }
    ],
    'cg': [
        { id: 'airtel_money', name: 'Airtel Money' },
        { id: 'mtn', name: 'MTN Mobile Money' }
    ],
    'td': [
        { id: 'airtel_money', name: 'Airtel Money' },
        { id: 'moov', name: 'Moov Africa' }
    ],
    'cf': [
        { id: 'orange_money', name: 'Orange Money' }
    ],
    'gq': [
        { id: 'mtn', name: 'MTN Mobile Money' }
    ],
    'cd': [
        { id: 'airtel_money', name: 'Airtel Money' },
        { id: 'orange_money', name: 'Orange Money' },
        { id: 'mpesa', name: 'M-Pesa' }
    ],
    'gh': [
        { id: 'mtn', name: 'MTN Mobile Money' },
        { id: 'vodafone_cash', name: 'Vodafone Cash' },
        { id: 'airteltigo', name: 'AirtelTigo' }
    ],
    'ng': [
        { id: 'mobile_money', name: 'Mobile Money' },
        { id: 'bank_transfer', name: 'Virement Bancaire' }
    ],
    'ke': [
        { id: 'mpesa', name: 'M-Pesa' },
        { id: 'airtel_money', name: 'Airtel Money' }
    ],
    'ug': [
        { id: 'airtel_money', name: 'Airtel Money' },
        { id: 'mtn', name: 'MTN Mobile Money' }
    ],
    'rw': [
        { id: 'mtn', name: 'MTN Mobile Money' },
        { id: 'airtel_money', name: 'Airtel Money' }
    ],
    'tz': [
        { id: 'mpesa', name: 'M-Pesa' },
        { id: 'airtel_money', name: 'Airtel Money' },
        { id: 'tigo', name: 'Tigo Pesa' },
        { id: 'halopesa', name: 'HaloPesa' }
    ],
    'zm': [
        { id: 'airtel_money', name: 'Airtel Money' },
        { id: 'mtn', name: 'MTN Mobile Money' }
    ],
    'mw': [
        { id: 'airtel_money', name: 'Airtel Money' },
        { id: 'mtn', name: 'MTN Mobile Money' }
    ],
    'za': [
        { id: 'bank_transfer', name: 'Virement Bancaire' }
    ],
}
