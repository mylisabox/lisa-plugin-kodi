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
        switch (action) {
            case "PLAY_TV_SHOW":
                return this.plugin.services.KodiService.playTvShow(infos.fields.show, infos.fields.number, room)
            case "PLAY_MOVIE":
                return this.plugin.services.KodiService.playMovie(infos.fields.movie, room)
        }
        return Promise.resolve()
    }
}

