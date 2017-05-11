function Broker() {
    const subscriptions = []

    this.send = (name, value) => {
        subscriptions.filter(s => s['name'] === name &&
                                  s.obj &&
                                  typeof s.obj.receive == 'function')
                     .forEach(s => { s.obj.receive(name, value) })
    }

    this.addSubscription = (subscriber, name) => {
        subscriptions.push({
            name: name,
            obj: subscriber
        })
    }
}

module.exports = Broker
