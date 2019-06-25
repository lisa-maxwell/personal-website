/*

  AngularJS 1.x app with mock (fake) data services 

*/
var angular;
var myApp = angular.module('myApp',['ngRoute','ngSanitize']);

myApp.config(['$locationProvider', function($locationProvider) {
  $locationProvider.hashPrefix('');
}]);

myApp.config(['$routeProvider','$locationProvider',
  function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', { templateUrl: 'views/home.html'})
        .when('/posts', { templateUrl: 'views/posts.html'})
        .when('/posts/:id', { templateUrl: 'views/post.html'})
        .when('/users',  { templateUrl: 'views/users.html'})
        .when('/users/:id', { templateUrl: 'views/user.html'})
        .when('/products',  { templateUrl: 'views/products.html'})
        .when('/products/:id', { templateUrl: 'views/product.html'})
        .when('/messages',  { templateUrl: 'views/messages.html'})
        .when('/gallery',  { templateUrl: 'views/gallery.html'})
        .otherwise({
            templateUrl: 'views/home.html'
        });
}]);

/* generic JSON data service used by the various controllers to get data */
myApp.service('dataService', function($http) {
    var dataPath = "./data/";
    return {
        getUsers: function() {
          return $http.get(dataPath+'people.json');
        },
        getProducts: function() {
          return $http.get(dataPath+'products.json');
        },
        getProduct: function(id,cb) {
          $http.get(dataPath+'products.json').then(function(r){
              r.data.products.filter(function(obj){
                  if (obj.id===id){
                      cb(obj);
                  }
              });
          });
        },
        getPosts: function() {
          return $http.get(dataPath+'posts.json');
        },
        getPost: function(id,cb) {
          $http.get(dataPath+'posts.json').then(function(r){
              r.data.posts.filter(function(obj){
                  if (obj.id===id){
                      cb(obj);
                  }
              });
          });
        },
        getMessages: function() {
          return $http.get(dataPath+'messages.json');
        }
    };

});

/* pagination service that is used to split data results into pages,
   and control the paging such as curr, prev, next, etc..
*/
myApp.factory('pagingService', function($rootScope) {
    
    var Pagination = function(ipp, $rootScope) {
        this.itemsPerPage = ipp||10;
        this.pagedItems = [];
        this.allItems = [];
        this.currentPage = 0;
        
        this.setItemsPerPage = function(ipp){this.itemsPerPage = ipp};
        this.setCurrentPage = function(cp){this.currentPage = cp};
        this.setItems = function(items){this.allItems = items};
        this.groupToPages = function () {
            this.pagedItems = [];
            for (var i = 0; i < this.allItems.length; i++) {
              if (i % this.itemsPerPage === 0) {
                this.pagedItems[Math.floor(i / this.itemsPerPage)] = [ this.allItems[i] ];
              } else {
                this.pagedItems[Math.floor(i / this.itemsPerPage)].push(this.allItems[i]);
              }
            }
            //console.log(this.pagedItems);
        };
        this.range = function (start, end) {
            var ret = [];
            if (!end) {
              end = start;
              start = 0;
            }
            for (var i = start; i < end; i++) {
              ret.push(i);
            }
            return ret;
        };
        this.prevPage= function () {
            if (this.currentPage > 0) {
              this.currentPage--;
            }
        };
        this.nextPage = function () {
            if (this.currentPage < this.pagedItems.length - 1) {
              this.currentPage++;
            }
        };
        this.setPage = function (n) {
            this.currentPage = n;
        };
    };
    
    return {
       Pagination: function(ipp, $rootScope) {
         return new Pagination(ipp);
       }
    };
    

});

myApp.controller('appCtrl', function() {
    angular.element(document).ready(function() {
        // init wow.js to watch scroll position for animations
        new WOW().init();
        
        // always collapse mobile nav after click
        angular.element('#collapsingNavbar li>a:not("[data-toggle]")').click(function() {
            angular.element('.navbar-toggler:visible').click();
        });
    });
 });

myApp.controller("usersCtrl", function($scope, dataService, pagingService){
  
    $scope.items = [];
    $scope.ps = pagingService.Pagination(6);
    
    // load the users data
    dataService.getUsers().then(function(r){
        $scope.items = r.data.people;
        $scope.ps.setItems($scope.items);
        $scope.ps.groupToPages();
    });
    
    // single user detail
    $scope.userDetail = function(u){
        $scope.selected = u;
        angular.element(document.querySelector('#userDetailModal')).modal("show");
    };

});

myApp.controller("productsCtrl", function($scope, dataService, pagingService, $routeParams){
    
    $scope.items = [];
    
    if ($routeParams.id) {
        // detail view
        dataService.getProduct(parseInt($routeParams.id), function(r){
            $scope.product = r;
        });
    }
    else {
        // list view
        $scope.ps = pagingService.Pagination(4);
        dataService.getProducts().then(function(r){
            $scope.items = r.data.products;
            $scope.ps.setItems($scope.items);
            $scope.ps.groupToPages();
        });
    }
});

myApp.controller("postsCtrl", function($scope, dataService, pagingService, $routeParams){
    
    //console.log($routeParams.id);
    $scope.items = [];
    
    if ($routeParams.id) {
        // detail view
        dataService.getPost(parseInt($routeParams.id), function(r){
            $scope.post = r;
        });
    }
    else {
        // list view
        $scope.ps = pagingService.Pagination(4);
        dataService.getPosts().then(function(r){
            $scope.items = r.data.posts;
            $scope.ps.setItems($scope.items);
            $scope.ps.groupToPages();
        });
    }
});

myApp.controller("messagesCtrl", function($scope, dataService, pagingService){
    
    $scope.items = [];
    
    $scope.select = function(m){
        $scope.selected = m;
    };
    
    // list view
    $scope.ps = pagingService.Pagination(8);
    dataService.getMessages().then(function(r){
        $scope.items = r.data.messages;
        $scope.ps.setItems($scope.items);
        $scope.ps.groupToPages();
    });
    
});