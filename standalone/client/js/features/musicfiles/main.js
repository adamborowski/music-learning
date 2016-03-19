/**
 * ******************************************************************************************************
 *
 *   Defines a logs feature
 *
 *  @author  aborowski
 *
 * ******************************************************************************************************
 */
'use strict';
import "./style/MusicFiles.less"
import FeatureBase from 'lib/FeatureBase';
import Routes from './Routes';

import MusicFileService from './service/MusicFileService';

import ListController from './controller/ListController';
import MusicFileController from './controller/MusicFileController';

import MusicFileDirective from './directive/MusicFileDirective';

class Feature extends FeatureBase {

    constructor() {
        super('musicfiles');
        this.routes = Routes;
    }

    execute() {
        this.controller('ListController', ListController);
        this.controller('MusicFileController', MusicFileController);
        this.service('MusicFileService', MusicFileService);
        this.directive('musicFile', MusicFileDirective);
    }
}

export default Feature;
