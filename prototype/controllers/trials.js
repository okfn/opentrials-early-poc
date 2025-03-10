'use strict';

var express = require('express');

var paginationService = require('../services/pagination');
var trialsService = require('../services/trials');
var searchService = require('../services/search');

function trialsList(request, response, next) {
  // Initialize pagination
  var pagination = paginationService.create({
    currentPage: request.query.page,
    itemsPerPage: request.query.ipp,
    baseUrl: request.url
  });

  // Initialize filter values
  var filterParams = request.query.filter || {};
  filterParams = filterParams.apply ? filterParams : null;

  // Get items and render page
  trialsService.getItems(pagination, filterParams).then(function(items) {
    response.render('index.html', {
      title: 'Find a trial',
      subtitle: 'The prototype currently features a single dataset ' +
        'of schizophrenia trial data',
      filterParams: filterParams,
      trials: items,
      pagination: pagination
    });
  }).catch(function(error) {
    console.log(error);
    return next();
  });
}

function trialDetails(request, response, next) {
  trialsService.getItem(request.params.id).then(function(item) {
    response.render('trial.html', {
      title: item.publicTitle,
      trial: item
    });
  }).catch(function(error) {
    console.log(error);
    return next();
  });
}

function searchLookup(request, response, next) {
  var filter = request.query.filter || '';
  var value = request.query.value || '';
  var indexes = searchService.indexes;

  var promise = null;
  if (indexes.hasOwnProperty(filter) && (value != '')) {
    promise = indexes[filter].lookup(value);
  } else {
    promise = searchService.lookup(value);
  }
  promise.then(function(results) {
    response.json(results);
  }).catch(function(error) {
    console.log(error);
    return next();
  });
}

var router = express.Router();
router.get('/', trialsList);
router.get('/trial/:id', trialDetails);
router.get('/search/lookup', searchLookup);

module.exports = router;
