function postData(url = ``, data = {}) {
  return fetch(url, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    redirect: 'follow',
    referrer: 'no-referrer',
    body: JSON.stringify(data),
  });
}

class Poller {
  /**
   * Wrapper around what would regularly be socket communications, but handled
   * through a POST-based polling loop
   */
  constructor(app) {
    this.app = app;
    var url = window.location;
    this.target =
      url.protocol + '//' + url.host + app.correctPathname() + 'socket_wrap';
    this.handleMessage = app._handleMessage;
    fetch(this.target)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        this.finishSetup(data.sid);
      });
  }

  finishSetup = (sid) => {
    this.sid = sid;
    this.poller_id = window.setInterval(() => this.poll(), POLLING_INTERVAL);
    this.app.setState({
      connected: true,
    });
  };

  close = () => {
    this.app.setState({ connected: false }, () => {
      this.app._socket = null;
    });
    window.clearInterval(this.poller_id);
  };

  send = (msg) => {
    // Post a messge containing the desired command
    postData(this.target, { message_type: 'send', sid: this.sid, message: msg })
      .then((res) => res.json())
      .then(
        (result) => {
          if (!result.success) {
            this.close();
          } else {
            this.poll(); // Get a response right now if there is one
          }
        },
        (error) => {
          console.log(error);
          this.close();
        }
      );
  };

  poll = () => {
    // Post message to query possible socket messages
    postData(this.target, { message_type: 'query', sid: this.sid })
      .then((res) => res.json())
      .then(
        (result) => {
          if (!result.success) {
            this.close();
          } else {
            let messages = result.messages;
            messages.forEach((msg) => {
              // Must re-encode message as handle message expects json
              // in this particular format from sockets
              // TODO Could refactor message parsing out elsewhere.
              this.handleMessage({ data: msg });
            });
          }
        },
        (error) => {
          console.log(error);
          this.close();
        }
      );
  };
}

export default Poller;
