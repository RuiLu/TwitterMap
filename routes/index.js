/*
 * GET main page.
 */

exports.index = function(req, res, next){
  res.render('index', { title: 'Tweet visualization', criteria:'New York state' });
};