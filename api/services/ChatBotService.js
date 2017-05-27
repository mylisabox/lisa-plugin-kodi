'use strict'

const Service = require('lisa-plugin').Service

/**
 * @module ChatBotService
 * @description ChatBot service
 */
module.exports = class ChatBotService extends Service {
    interact(action, infos) {
        let room = infos.fields.room
        if (room) {
            room = room.id
        }
        let episode = infos.fields.episode
        if (episode) {
            episode = ("0" + episode).slice(-2)
        }
        switch (action) {
            case "PLAY_TV_SHOW":
                return this.plugin.services.KodiService.playTvShow(infos.fields.show, infos.fields.season, episode, room)
            case "PLAY_MOVIE":
                return this.plugin.services.KodiService.playMovie(infos.fields.movie, room)
            case "PAUSE_MEDIA_CENTER":
            case "PLAY_MEDIA_CENTER":
                return this.plugin.services.KodiService.playPause(room)
            case "STOP_MEDIA_CENTER":
                return this.plugin.services.KodiService.stop(room)
        }
        return Promise.resolve()
    }
}

