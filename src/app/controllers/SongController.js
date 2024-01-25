class SongController {
  async createSong(req, res) {
    const name = req.body.name;
    const description = req.body.description;
    const artistName = req.body.artistName;

    console.log(name);

    res.send('create song');
  }
}

module.exports = new SongController();
