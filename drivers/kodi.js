'use strict'

const Driver = require('lisa-plugin').Driver
const Kodi = require('kodi-rpc')

module.exports = class KodiDriver extends Driver {
    init() {
        this.devices = []
        this._browser = this.lisa.bonjour.find({ type: 'http' }, service => {
            this.log.debug('Found an HTTP server:', service)
            if (service.fqdn.toLowerCase().indexOf('kodi') !== -1 || service.fqdn.toLowerCase().indexOf('osmc') !== -1
                || service.fqdn.toLowerCase().indexOf('libreelec') !== -1 || service.fqdn.toLowerCase().indexOf('xbmc') !== -1) {
                this.manageDeviceFromBonjourService(service)
            }
        })
        return Promise.resolve()
    }

    saveDevice(deviceData) {
        return this.lisa.createOrUpdateDevices(deviceData)
    }

    getDevices() {
        return Promise.resolve(this.devices)
    }

    getDevicesData(devices) {
        return Promise.resolve(devices)
    }

    setDeviceValue(device, key, newValue) {

    }

    setDevicesValue(devices, key, newValue) {

    }

    unload() {
        this._browser.stop()
        return Promise.resolve()
    }

    manageDeviceFromBonjourService(bonjourService) {
        this.lisa.findDevices().then(devices => {
            const newDevice = {
                name: bonjourService.name,
                type: this.lisa.DEVICE_TYPE.MEDIA,
                driver: 'vpl',
                data: {
                    name: bonjourService.name
                },
                privateData: {
                    ip: this._getIPV4Address(bonjourService.addresses),
                    port: bonjourService.port,
                    id: bonjourService.fqdn
                },
                template: require('../widgets/kodi.json')
            }
            let found = false
            for (let device of devices) {
                if (device.privateData.id === bonjourService.fqdn) {
                    found = true
                    break
                }
            }
            if (!found) {
                this.devices.push(newDevice)
                return this.lisa.createOrUpdateDevices(newDevice)
            }
        }).catch(err => {
            this.log.error(err)
        });
    }

    mute(roomId) {
        const criteria = {}
        if (roomId) {
            criteria.roomId = roomId
        }
        return this.lisa.findDevices(criteria).then(devices => {
            if (devices && devices.length > 0) {
                const device = devices[0]
                const kodi = new Kodi(device.privateData.ip, device.privateData.port)

                return kodi.Application.SetMute([true])
            }
            return Promise.resolve()
        })
    }

    unmute(roomId) {
        const criteria = {}
        if (roomId) {
            criteria.roomId = roomId
        }
        return this.lisa.findDevices(criteria).then(devices => {
            if (devices && devices.length > 0) {
                const device = devices[0]
                const kodi = new Kodi(device.privateData.ip, device.privateData.port)
                return kodi.Application.SetMute([false])
            }
            return Promise.resolve()
        })
    }

    setVolume(level, roomId) {
        const criteria = {}
        if (roomId) {
            criteria.roomId = roomId
        }
        level = parseInt(level)
        return this.lisa.findDevices(criteria).then(devices => {
            if (devices && devices.length > 0) {
                const device = devices[0]
                const kodi = new Kodi(device.privateData.ip, device.privateData.port)
                return kodi.Application.SetVolume({ volume: level })
            }
            return Promise.resolve()
        })
    }

    increaseVolume(steps, roomId) {
        const criteria = {}
        if (roomId) {
            criteria.roomId = roomId
        }
        if (steps) {
            steps = parseInt(steps)
        }
        else {
            steps = 1
        }
        return this.lisa.findDevices(criteria).then(devices => {
            if (devices && devices.length > 0) {
                const device = devices[0]
                const kodi = new Kodi(device.privateData.ip, device.privateData.port)
                const volumeCommands = []
                for (let i = 0; i < steps; i++) {
                    volumeCommands.push(kodi.Application.SetVolume({ volume: 'increment' }))
                }
                return Promise.all(volumeCommands)
            }
            return Promise.resolve()
        })
    }

    decreaseVolume(steps, roomId) {
        const criteria = {}
        if (roomId) {
            criteria.roomId = roomId
        }
        if (steps) {
            steps = parseInt(steps)
        }
        else {
            steps = 1
        }
        return this.lisa.findDevices(criteria).then(devices => {
            if (devices && devices.length > 0) {
                const device = devices[0]
                const kodi = new Kodi(device.privateData.ip, device.privateData.port)
                const volumeCommands = []
                for (let i = 0; i < steps; i++) {
                    volumeCommands.push(kodi.Application.SetVolume({ volume: 'decrement' }))
                }
                return Promise.all(volumeCommands)
            }
            return Promise.resolve()
        })
    }

    playTvShow(show, season, episode, roomId) {
        const criteria = {}
        if (roomId) {
            criteria.roomId = roomId
        }
        if (season) {
            season = parseInt(season)
        }
        if (episode) {
            episode = parseInt(episode)
        }

        return this.lisa.findDevices(criteria).then(devices => {
            if (devices && devices.length > 0) {
                const device = devices[0]
                const kodi = this._getKodi(device)
                return kodi.VideoLibrary.GetTVShows().then(data => {
                    if (data.error) {
                        return Promise.reject(data.error)
                    }
                    else {
                        let kodiShows = data.result.tvshows.filter(function (item) {
                            return show.toLowerCase() === item.label.toLowerCase() ? item : null
                        })
                        if (kodiShows.length === 0) {
                            kodiShows = data.result.tvshows.filter(function (item) {
                                return item.label.toLowerCase().indexOf(show.toLowerCase()) !== -1 ? item : null
                            })
                        }

                        if (kodiShows && kodiShows.length > 0) {
                            const criteria = {
                                tvshowid: kodiShows[0].tvshowid,
                                properties: ["title", "thumbnail", "playcount", "episode", "season", "showtitle",
                                    "tvshowid", "uniqueid"]
                            }
                            if (season) {
                                criteria.season = season
                            }
                            return kodi.VideoLibrary.GetEpisodes(criteria).then(data => {
                                if (data.error) {
                                    return Promise.reject(data.error)
                                }
                                else {
                                    const episodes = data.result.episodes
                                    if (episodes && episodes.length > 0) {
                                        if (episode) {
                                            const foundEpisodes = episodes.filter(item => {
                                                return item.episode === episode
                                            })
                                            return kodi.Player.Open({ item: { episodeid: foundEpisodes[0].episodeid } })
                                        }
                                        else {
                                            const episodesToWatch = episodes.filter(item => {
                                                return item.playcount === 0
                                            })
                                            return kodi.Player.Open({
                                                item: {
                                                    episodeid: episodesToWatch.length === 0 ?
                                                        episodes[episodes.length - 1].episodeid :
                                                        episodesToWatch[0].episodeid
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
                    if (data.error) {
                        return Promise.reject(data.error)
                    }
                    else {
                        let kodiMovies = data.result.movies.filter(function (item) {
                            return movie.toLowerCase() === item.label.toLowerCase() ? item : null
                        })
                        if (kodiMovies.length === 0) {
                            kodiMovies = data.result.movies.filter(function (item) {
                                return item.label.toLowerCase().indexOf(movie.toLowerCase()) !== -1 ? item : null
                            })
                        }

                        if (kodiMovies) {
                            return kodi.Player.Open({ item: { movieid: kodiMovies[0].movieid } })
                        }
                    }
                })
            }
        })
        return Promise.resolve()
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
                    return kodi.Player.PlayPause({ playerid: data.result[0].playerid })
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
                    return kodi.Player.Stop({ playerid: data.result[0].playerid })
                })
            }
            return Promise.resolve()
        })
    }

    _getIPV4Address(addresses) {
        let ipv4Adress
        for (let address of addresses) {
            if (address.indexOf('::') === -1) {
                ipv4Adress = address
                break
            }
        }
        return ipv4Adress
    }

    _getKodi(device) {
        let url = device.privateData.ip
        if (device.privateData.login && device.privateData.login !== '' && device.privateData.password
            && device.privateData.password !== '') {
            url = device.privateData.login + ':' + device.privateData.password + '@' + device.privateData.ip
        }
        return new Kodi(url, device.privateData.port)
    }
}
