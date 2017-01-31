angular.module('starter.controllers', [])
// .factory('factoryPassMyObject', ['$http', function($http, $q, ApiEndpoint) {
.factory('factoryPassMyObject', ['$http', function($http, $q, $sce) {
  var data;
  var objectIndex;
  var mySiteDataObject;
  var nonceURL= 'https://test.abu.edu.ng/srcapp/?json=get_nonce&controller=posts&method=create_post';
  var createPostURL = 'https://test.abu.edu.ng/srcapp/api/?';
    return {
        getData: function () {
        return $http.get('https://test.abu.edu.ng/srcapp/?json=get_posts').then(function(d) { 
            data = d;
            return data;
          }); 
        },
        setData: function (httpdata) { 
          data = httpdata;
        },
        getMyData: function (){
          return data;
        },
        setIndex: function (index){
          objectIndex = index;
        },
        getIndex: function(){
          return objectIndex;
        },
        setNewsObject: function(newsObject){
          mySiteDataObject = newsObject;
        },
        getNewsObject: function(){
          return mySiteDataObject;
        }
    };
}])
.factory('factoryPostComments', ['$http', function ($http, $q){
  var email;
  var password;
  var comment;
  return {
    setCommentData: function (scopeEmail, scopePassword, scopeComment){
      email = scopeEmail;
      password = scopePassword;
      comment = scopeComment;
    },
    getCommentsData: function (){
      var someObject =  {
        userEmail: email,
        userPassword: password,
        userComment: comment
      }
      return someObject;
    },
    sendComment: function (title, comment){
      $http.post(createPostURL+'title'+title+'&comment'+comment).then(function (response){
        console.log("Response is "+response.status);
      },function(error){
        console.log(error);
      });
    },
    getNonceValue: function (){
      var nonceValue;
      $http({
        url: nonceURL,
        method: 'GET'
      }).then(function (response){
        nonceValue = response.nonce;
      },function (error){
        console.log("There is an error"+error.status)
      })
      return nonceValue;
    }
  };
}])
.filter("htmlToPlaintext", function() {
  return function(input) {
    return input.replace(/<[^>]+>/gm, '');
  }
})
.controller('AppCtrl', function($scope, $ionicModal, $timeout, $http, $state, $ionicPopup)
{

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);
    
    $http.get('https://test.abu.edu.ng/srcapp/api/user/generate_auth_cookie/?username='+$scope.loginData.username+'&password='+$scope.loginData.password).then(function (response){
      $scope.modal.hide();
      if (!response.data.error){
        $ionicPopup.alert({
          title: "Logging In",
          template: JSON.stringify(response.data)
        });
        var pouch = new PouchDB('mydb', {adapter: 'websql'});
        //Clear all data
        pouch.allDocs().then(function (result) { 
          return Promise.all( result.rows.map( function (row) 
          { 
            return pouch.remove(row.id, row.value.rev); 
          })); 
        }).then(function () {
          // done!
          console.log("All docs deleted");
          pouch.put({
            _id: 'sessionCookie',
            cookieValue: response.data.cookie
          }).then(function (response) {
            // handle response
            console.log("Successfully put document");
            $state.go("getSiteData");
          }).catch(function (err) {
            console.log(err);
          });//end put
        }).catch(function (err) {
          // error!
          console.log("Documents Not deleted"+error.data.error);
        });
      }
      else
      {
        //$state.go("app.register");
        $ionicPopup.alert({
          title: "Error Logging In",
          template: JSON.stringify(response.data.error)
        });

      }
    }, function(error){
      $ionicPopup.alert({
        title: error.data.status,
        template: "An error occurred: \n"+error.data.error
      }) 
    });

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  }; // Do login
})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 } 
  ];
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
})
.controller('GetDataCtrl',function($scope, $http, factoryPassMyObject) {
$scope.doRefresh = function (){
  factoryPassMyObject.getData().then(function (data){
      $scope.siteData = data.data;
      var dataData = data.data.posts;
      $scope.getTheIndex = function (index){
        factoryPassMyObject.setIndex(index);
        factoryPassMyObject.setNewsObject(dataData[index]);
      } 
    },function (error){
        alert("Some thing is wrong: "+ JSON.stringify(error));
    }).finally(function(){
      $scope.$broadcast('scroll.refreshComplete');
    });
};

    /*factoryPassMyObject.getData().then(function (data){
      $scope.siteData = data.data;
      var dataData = data.data.posts;
      $scope.getTheIndex = function (index){
        factoryPassMyObject.setIndex(index);
        factoryPassMyObject.setNewsObject(dataData[index]);
      } 
    },function (error){
        alert("Some thing is wrong: "+ JSON.stringify(error));
    });*/
})
.controller('PageController',function($scope,factoryPassMyObject, $ionicModal){
  var someIndex = factoryPassMyObject.getIndex();
  $scope.siteDataObject = factoryPassMyObject.getNewsObject();
  // Modal 1
  $ionicModal.fromTemplateUrl('templates/modal.html', {
    id: '1', // We need to use an ID to identify the modal that is firing the event!
    scope: $scope,
    backdropClickToClose: false,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.oModal1 = modal;
  });

  // Modal 2
  $ionicModal.fromTemplateUrl('templates/postcomment.html', {
    id: '2', // We need to use and ID to identify the modal that is firing the event!
    scope: $scope,
    backdropClickToClose: false,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.oModal2 = modal;
  });

  
  $scope.openModal = function(index) {
      if (index == 1) $scope.oModal1.show();
      else $scope.oModal2.show();
    };

  $scope.closeModal = function(index) {
    if (index == 1) $scope.oModal1.hide();
    else $scope.oModal2.hide();
  };

  /* Listen for broadcasted messages */

  $scope.$on('modal.shown', function(event, modal) {
    console.log('Modal ' + modal.id + ' is shown!');
  });

  $scope.$on('modal.hidden', function(event, modal) {
    console.log('Modal ' + modal.id + ' is hidden!');
  });

  // Cleanup the modals when we're done with them (i.e: state change)
  // Angular will broadcast a $destroy event just before tearing down a scope 
  // and removing the scope from its parent.
  $scope.$on('$destroy', function() {
    console.log('Destroying modals...');
    $scope.oModal1.remove();
    $scope.oModal2.remove();
  });
})
.controller('RegisterController', function ($scope, $http, $ionicPopup, $ionicModal, $timeout, $state){
  var nonceValue;
  $scope.registerData = {};
  var getNonceUrl = 'https://test.abu.edu.ng/srcapp/api/get_nonce/?controller=user&method=register';

  $scope.doRegister = function (){
    $http.get(getNonceUrl).then(function(response){
      nonceValue = response.data.nonce;
      console.log("Nonce is: \n"+response.data.nonce);
      var registerURL= 'https://test.abu.edu.ng/srcapp/api/user/register/?username='+$scope.registerData.username+'&email='+$scope.registerData.email+'&nonce='+nonceValue+'&display_name='+$scope.registerData.username+'&notify=no&user_pass='+$scope.registerData.password;
      var getNonceUrl = 'https://test.abu.edu.ng/srcapp/api/get_nonce/?controller=user&method=register';
      $http.post(registerURL).then(function (response){
        $ionicPopup.alert({
          title: 'Registration Done',
          template: 'You have now been registered to the platform'
        });
        $state.go("app.getSiteData");
      }, function(error){
        console.log('Error in registration. Please try again'+error.data.error);
      });
    }, function (error){
      console.log("Nonce Issue: \n"+error.data.error);
    });//getNonce
  };

  /* Create a factory or service to use for the login modal not efficient using more than one
  */
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);
    
    $http.get('https://test.abu.edu.ng/srcapp/api/user/generate_auth_cookie/?username='+$scope.loginData.username+'&password='+$scope.loginData.password).then(function (response){
      $scope.modal.hide();
      if (response.data.status === "ok"){
        $ionicPopup.alert({
          title: "Logging In",
          template: JSON.stringify(response.data)
        });
        $state.go("app.register");
      }
      else
      {
        $ionicPopup.alert({
          title: response.data.status,
          template: JSON.stringify(response.data.error)
        });
      }
    }, function(error){
      $ionicPopup.alert({
        title: error.data.status,
        template: "An error occurred: \n"+error.data.error
      }) 
    });

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };

});
