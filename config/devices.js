import {createRequire} from 'module';

const require = createRequire(import.meta.url);
const template = require('../widgets/kodi.json')

export default [
  {
    pairing: 'settings',
    name: {
      en: 'KODI',
      fr: 'KODI',
    },
    description: {
      en: 'Add XBMC KODI media center',
      fr: 'Ajout d\'un média center XBMC KODI',
    },
    driver: 'kodi',
    template: template,
    type: 'media',
    image: 'kodi.svg',
    imageOn: 'kodi.svg',
    imageOff: 'kodi.svg',
    settings: {
      'type': 'column',
      'crossAxisAlignment': 3,
      'children': [
        {
          'type': 'text_field',
          'id': 'ip',
          'required': true,
          'textInputAction': 6,
          'decoration': {
            'labelText': 'URL*',
          },
        },
        {
          'type': 'text_field',
          'id': 'port',
          'required': true,
          'maxLength': 4,
          'minLength': 2,
          'textInputAction': 6,
          'decoration': {
            'labelText': 'Port*',
          },
        },
        {
          'type': 'text_field',
          'id': 'login',
          'private': true,
          'textInputAction': 6,
          'decoration': {
            'labelText': 'Login',
          },
        },
        {
          'type': 'text_field',
          'id': 'password',
          'private': true,
          'textInputAction': 2,
          'decoration': {
            'labelText': 'Password',
          },
        },
      ],
    },
  },
]
