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
        driver: 'kodi',
        template: template,
        type: 'media',
        image: 'kodi_logo.png',
        settings: {
            'type': 'column',
            'crossAxisAlignment': 3,
            'children': [
                {
                    controlType: 'textbox',
                    type: 'ip',
                    name: 'ip',
                    label: {
                        en: 'URL'
                    },
                    required: true,
                    private: true
                },
                {
                    controlType: 'textbox',
                    type: 'number',
                    maxLength: 4,
                    minLength: 2,
                    name: 'port',
                    label: {
                        en: 'Port'
                    },
                    required: true,
                    private: true
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
            ],
        }
    }
]
