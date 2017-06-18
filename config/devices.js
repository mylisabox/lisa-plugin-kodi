const template = require('../widgets/kodi.json')

module.exports = [
    {
        pairing: 'settings',
        name: {
            en: 'KODI',
            fr: 'KODI'
        },
        description: {
            en: 'Add XBMC KODI media center',
            fr: 'Ajout d\'un média center XBMC KODI'
        },
        image: 'kodi_logo.png',
        settings: [
            {
                controlType: 'textbox',
                type: 'hidden',
                name: 'template',
                defaultValue: template,
                required: true
            },
            {
                controlType: 'textbox',
                type: 'url',
                name: 'url',
                label: {
                    en: 'URL'
                },
                required: true
            },
            {
                controlType: 'textbox',
                type: 'number',
                name: 'port',
                label: {
                    en: 'Port'
                },
                required: true
            },
            {
                controlType: 'textbox',
                type: 'text',
                name: 'login',
                label: {
                    en: 'Login',
                    fr: 'Identifiant'
                },
                private: true
            },
            {
                controlType: 'textbox',
                type: 'password',
                name: 'password',
                label: {
                    en: 'Password',
                    fr: 'Mot de passe'
                },
                private: true
            }
        ]
    }
]
