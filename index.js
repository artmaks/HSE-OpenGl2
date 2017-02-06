/**
 * Created by tema on 27.11.16.
 */

const express = require('express');

const app = express();
// app.use(express.logger());

app.use('/', express.static(`${__dirname}/`));
app.use('/css', express.static(`${__dirname}/css`));
app.use('/js', express.static(`${__dirname}/js`));

const port = process.env.PORT || 5000;
app.listen(port, () => {
	console.log(`Listening on ${port}`);
});
