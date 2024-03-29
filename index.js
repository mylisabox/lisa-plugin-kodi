import {Plugin} from 'lisa-plugin'
import {createRequire} from 'module';
import config from './config/index.js'
import drivers from './drivers/index.js'

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

export default class KodiPlugin extends Plugin {
  /**
   * Initialisation of your plugin
   * Called once, when plugin is loaded
   * @return Promise
   */
  init() {
    return super.init()
  }

  /**
   * Called when
   * @param action to execute
   * @param infos context of the action
   * @return Promise
   */
  interact(action, infos) {
    let room = infos.fields.room || infos.context.room
    if (room) {
      room = room.id
    }
    let episode = infos.fields.episode
    if (episode) {
      episode = ('0' + episode).slice(-2)
    }
    switch (action) {
    case 'MUTE_VOLUME':
      return this.drivers.kodi.mute(room)
    case 'UNMUTE_VOLUME':
      return this.drivers.kodi.unmute(room)
    case 'SET_VOLUME':
      return this.drivers.kodi.setVolume(infos.fields.number, room)
    case 'INCREASE_VOLUME_AGAIN':
    case 'INCREASE_VOLUME':
      return this.drivers.kodi.increaseVolume(infos.fields.number, room)
    case 'DECREASE_VOLUME_AGAIN':
    case 'DECREASE_VOLUME':
      return this.drivers.kodi.decreaseVolume(infos.fields.number, room)
    case 'PLAY_TV_SHOW':
      return this.drivers.kodi.playTvShow(infos.fields.show, infos.fields.season, episode, room)
    case 'PLAY_MOVIE':
      return this.drivers.kodi.playMovie(infos.fields.movie, room)
    case 'PAUSE_MEDIA_CENTER':
    case 'PLAY_MEDIA_CENTER':
      return this.drivers.kodi.playPause(room)
    case 'STOP_MEDIA_CENTER':
      return this.drivers.kodi.stop(room)
    default:
      return Promise.resolve()
    }
  }

  constructor(app) {
    super(app, {
      config: config,
      drivers: drivers,
      pkg: pkg,
    })
  }
}
