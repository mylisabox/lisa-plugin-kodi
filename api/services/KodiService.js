'use strict'

const Service = require('lisa-plugin').Service
const Kodi = require('kodi-rpc')

/**
 * @module KodiService
 * @description Kodi service
 */
module.exports = class KodiService extends Service {
    init() {
        this._browser = this.lisa.bonjour.find({type: 'http'}, service => {
            this.log.debug('Found an HTTP server:', service)
            if (service.fqdn.toLowerCase().indexOf('kodi') != -1 || service.fqdn.toLowerCase().indexOf('osmc') != -1
                || service.fqdn.toLowerCase().indexOf('libreelec') != -1 || service.fqdn.toLowerCase().indexOf('xbmc') != -1) {
                this.manageDeviceFromBonjourService(service)
            }
        })
        return Promise.resolve()
    }

    playTvShow(show, season, episode, roomId) {
        const criteria = {}
        if (roomId) {
            criteria.roomId = roomId
        }
        return this.lisa.findDevices(criteria).then(devices => {
            if (devices && devices.length > 0) {
                const device = devices[0]
                const kodi = new Kodi(device.privateData.ip, device.privateData.port)
                return kodi.VideoLibrary.GetTVShows().then(data => {
                    console.log(data)
                    if (data.error) {
                        return Promise.reject(data.error)
                    }
                    else {
                        let kodiShows = data.result.tvshows.filter(function (item) {
                            return show.toLowerCase() === item.label.toLowerCase() ? item : null
                        })
                        if (kodiShows.length == 0) {
                            kodiShows = data.result.tvshows.filter(function (item) {
                                return item.label.toLowerCase().indexOf(show.toLowerCase()) != -1 ? item : null
                            })
                        }

                        if (kodiShows && kodiShows.length > 0) {
                            return kodi.VideoLibrary.GetEpisodes({tvshowid: kodiShows[0].tvshowid}).then(data => {
                                if (data.error) {
                                    return Promise.reject(data.error)
                                }
                                else {
                                    const episodes = data.result.episodes
                                    if (episodes.length > 0) {
                                        if (episode) {
                                            const foundEpisodes = episodes.filter(item => {
                                                return item.label.toLowerCase().indexOf(season + 'x' + episode + '.') != -1
                                            })
                                            return kodi.Player.Open({item: {episodeid: foundEpisodes[0].episodeid}})
                                        }
                                        else {
                                            return kodi.Player.Open({
                                                item: {
                                                    episodeid: episodes[episodes.length - 1].episodeid
                                                }
                                            })
                                        }
                                    }
                                }
                            })
                        }
                    }
                })
            }
            return Promise.resolve()
        })
    }

    playMovie(movie, roomId) {
        const criteria = {}
        if (roomId) {
            criteria.roomId = roomId
        }
        return this.lisa.findDevices(criteria).then(devices => {
            if (devices && devices.length > 0) {
                const device = devices[0]
                const kodi = new Kodi(device.privateData.ip, device.privateData.port)
                return kodi.VideoLibrary.GetMovies().then(data => {
                    console.log(data)
                    if (data.error) {
                        return Promise.reject(data.error)
                    }
                    else {
                        let kodiMovies = data.result.movies.filter(function (item) {
                            return movie.toLowerCase() === item.label.toLowerCase() ? item : null
                        })
                        if (kodiMovies.length == 0) {
                            kodiMovies = data.result.movies.filter(function (item) {
                                return item.label.toLowerCase().indexOf(movie.toLowerCase()) != -1 ? item : null
                            })
                        }

                        if (kodiMovies) {
                            return kodi.Player.Open({item: {movieid: kodiMovies[0].movieid}})
                        }
                    }
                })
            }
        })
        return Promise.resolve()
    }

    manageDeviceFromBonjourService(bonjourService) {
        this.lisa.findDevices().then(devices => {
            const newDevice = {
                name: bonjourService.name,
                type: this.lisa.DEVICE_TYPE.MEDIA,
                data: {
                    name: bonjourService.name
                },
                privateData: {
                    ip: this._getIPV4Address(bonjourService.addresses),
                    port: bonjourService.port,
                    id: bonjourService.fqdn
                },
                template: require('../../widgets/kodi.json')
            }
            for (let device of devices) {
                if (device.privateData.id == bonjourService.fqdn) {
                    newDevice.id = device.id
                    newDevice.roomId = device.roomId
                    newDevice.name = device.name
                    newDevice.data.name = device.data.name
                    break
                }
            }
            return this.lisa.createOrUpdateDevices(newDevice)
        }).catch(err => {
            this.log.error(err)
        });
    }

    playPause(roomId) {
        const criteria = {}
        if (roomId) {
            criteria.roomId = roomId
        }
        return this.lisa.findDevices(criteria).then(devices => {
            if (devices && devices.length > 0) {
                const device = devices[0]
                const kodi = new Kodi(device.privateData.ip, device.privateData.port)
                return kodi.Player.GetActivePlayers().then(data => {
                    return kodi.Player.PlayPause({playerid: data.result[0].playerid})
                })
            }
            return Promise.resolve()
        })
    }

    stop(roomId) {
        const criteria = {}
        if (roomId) {
            criteria.roomId = roomId
        }
        return this.lisa.findDevices(criteria).then(devices => {
            if (devices && devices.length > 0) {
                const device = devices[0]
                const kodi = new Kodi(device.privateData.ip, device.privateData.port)
                return kodi.Player.GetActivePlayers().then(data => {
                    return kodi.Player.Stop({playerid: data.result[0].playerid})
                })
            }
            return Promise.resolve()
        })
    }

    _getIPV4Address(addresses) {
        let ipv4Adress
        for (let address of addresses) {
            if (address.indexOf('::') == -1) {
                ipv4Adress = address
                break
            }
        }
        return ipv4Adress
    }
}

