App = {
  web3Provider: null,
  contracts: {},
  //init templates for voting causes
  init: function() {
    // Load causes.
    $.getJSON('../causes.json', function(data) {
      var causesRow = $('#causesRow');
      var causeTemplate = $('#causeTemplate');

      for (var i = 0; i < data.length; i++) {
        causeTemplate.find('.panel-title').text(data[i].name);
        causeTemplate.find('img').attr('src', data[i].picture);
        causeTemplate.find('.location').text(data[i].location);
        causeTemplate.find('.description').text(data[i].description);
        causesRow.append(causeTemplate.html());
      }
       //window.localStorage.clear();

       var arr=[];

       if(localStorage.getItem('myStorage') !== null) {

       arr = JSON.parse(localStorage.getItem('myStorage')).data;
       for(var i = 0; i < arr.length; i++) {
       var obj = arr[i];
       causeTemplate.find('.panel-title').text(obj.name);
       causeTemplate.find('img').attr('src', obj.picture);
       causeTemplate.find('.location').text(obj.location);
       causeTemplate.find('.description').text(obj.description);
       causesRow.append(causeTemplate.html());
      }
}

    });

    return App.initWeb3();
  },

  initWeb3: function() {
    // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  //Belows are functions related to contract
  initContract: function() {
    $.getJSON('Charity.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var CharityArtifact = data;
      App.contracts.Charity = TruffleContract(CharityArtifact);

      // Set the provider for our contract
      App.contracts.Charity.setProvider(App.web3Provider);
      App.initialize();

      App.contracts.Charity.deployed().then(function(instance) {
        votingInstance = instance;
        // Populate default charities
      }).catch(function(err) {
        console.log(err.message);
      });

    });

    return App.bindEvents();
  },

  initialize: function() {
    //use web3 to get the user's accounts: what accounts?
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      web3.eth.getBalance(accounts[0], function(error, balance) {
        $("#balance").text("Your balance: " + web3.fromWei(balance, "ether") + " ETH");
      })
      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }

        var account = accounts[0]; //how to refer to the user account

        App.contracts.Charity.deployed().then(function(instance) {
          votingInstance.endTime().then(function(result) {

            console.log(result);
          });

          votingInstance = instance;
          // Execute voting as a transaction by sending account
          votingInstance.donations(accounts[0]).then(function(result) {
            console.log(result);
            $("#donations").text("Your donations: " + web3.fromWei(result, "ether") + " ETH");
          }).catch(function(err) {
            console.log(err.message);
          });
        }).catch(function(err) {
          console.log(err.message);
        });
      });

    })


  },

  //after clicking on vote or donate
  bindEvents: function() {
    $(document).on('click', '.btn-donate', App.handleDonate);
    $(document).on('click', '.btn-vote', App.handleVote);
    $(document).on('click', '.btn-create', App.handleCreateContract)
    $(document).on('click', '.btn-addVotingOption', App.handleAddVotingOption)
    $(document).on('click', '.btn-getVotingOptions', App.handleGetVotingOptions)
    $(document).on('click', '.btn-startVoting', App.handleStartVoting)
    $(document).on('click', '.btn-disperse', App.handleDisperse)
  },

 handleDonate: function(event) {
   //if this method is called, the default action of the event will not be triggered
   event.preventDefault();
   //get the input value from donator
   var amount=document.getElementById("amount").value;
   //get account
   web3.eth.getAccounts(function(error, accounts) {
   if (error) {
     console.log(error);
   }
   //get account balance
   web3.eth.getBalance(accounts[0],function(error, balance) {
   var balance = web3.fromWei(balance, "ether").toNumber();
   console.log(balance)
   if(amount > balance) //if donation amount exceeds account getBalance
   { alert("Not enough balance");
   } else {//donate

     App.contracts.Charity.deployed().then(function(instance) {
       votingInstance = instance;
       //convert ether to wei
       var value= web3.toWei(amount, "ether");
     votingInstance.donate({from: accounts[0], value: value})
     .then(function() {
       //check the charity balance
       votingInstance.getBalance().then(function(res) {
           console.log(res.toString())
       });
     });
   }).then(function(result) {
     //after successfully calling vote function in contract, sync the UI with our newly stored data
   $('.btn-donate').text('Success').attr('disabled', true);
   }).catch(function(err) {
     console.log(err.message);
   });
   }
})

 });


 },

  handleVote: function(event) {
    //if this method is called, the default action of the event will not be triggered
    event.preventDefault();

    //event.target is button with data-id for a given cause
    var causeId = parseInt(document.getElementById("amount").value);
    console.log(causeId);

    var votingInstance;

    //use web3 to get the user's accounts:
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0]; //how to refer to the user account

      App.contracts.Charity.deployed().then(function(instance) {
        votingInstance = instance;
        // Execute voting as a transaction by sending account
        // votingInstance.addVoteOption("WWF", "0x1000000000000000000000000000000000000000");
        votingInstance.vote(causeId);
      }).then(function(result) {
        //after successfully calling vote function in contract, sync the UI with our newly stored data
        $('.panel-vote').eq(causeId).find('button').text('Success').attr('disabled', true);
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },


   handleAddVotingOption: function(event) {
     //if this method is called, the default action of the event will not be triggered
     event.preventDefault();
     // var causeName = parseInt($(event.target).data('id'));
     // var causeAddress = parseInt($(event.target).data('id'));
     var name=document.getElementById("name").value;
     var pk=document.getElementById("pk").value;
     var location = document.getElementById("location").value;
     var image = document.getElementById("file").value;
     var des = document.getElementById("des").value;

     var cause= {
       "name": name,
       "picture": image,
       "location": location,
       "description": des
     }

     var arr=[];
     var obj = localStorage.getItem('myStorage');//obj is a string

     if(obj) {
    //if the key 'myStorage' exists, get the data array
       arr = JSON.parse(obj).data;

     }

     arr.push(cause); //add new cause to the array
     var newobj = {data: arr}; //new JSON object
     localStorage.setItem('myStorage', JSON.stringify(newobj));


     document.getElementById("name").value = "";
     document.getElementById("pk").value = "";
     document.getElementById("location").value = "";
     document.getElementById("file").value = "";


    var votingInstance;

    //use web3 to get the user's accounts:
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0]; //how to refer to the user account

      App.contracts.Charity.deployed().then(function(instance) {
        votingInstance = instance;
        // Execute voting as a transaction by sending account
        votingInstance.addVoteOption(name, pk);
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },


  handleGetVotingOptions: function(event) {
    //if this method is called, the default action of the event will not be triggered
    event.preventDefault();
    var votingInstance;

    //use web3 to get the user's accounts:
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0]; //how to refer to the user account

      App.contracts.Charity.deployed().then(function(instance) {
        votingInstance = instance;
        // Execute voting as a transaction by sending account
        votingInstance.votingOptionsCount().then(function(result) {
          $("#votingOptionsList").text("");
          for (i = 0; i < result['c'][0]; i++) {
            votingInstance.getVotingOption(i).then(function(result) {
              console.log(result);
              $("#votingOptionsList").html($("#votingOptionsList").html() + web3.toAscii(result[0]) + ", " + result[1] + ", " + web3.fromWei(result[2], "ether") + "<br/>");
            });
          }
        });
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },


  handleStartVoting: function(event) {
    //if this method is called, the default action of the event will not be triggered
    event.preventDefault();
    var votingInstance;

    //use web3 to get the user's accounts:
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0]; //how to refer to the user account

      App.contracts.Charity.deployed().then(function(instance) {
        votingInstance = instance;
        // Execute voting as a transaction by sending account
        votingInstance.startVoting(30); //TODO make the duration a text box to set
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },


  handleCreateContract: function(event) {
    //if this method is called, the default action of the event will not be triggered
    console.log("Here");
    event.preventDefault();
    var votingInstance;


    App.contracts.Charity.deployed().then(function(instance) {
      votingInstance = instance;
      votingInstance.addVoteOption("LovePanda", 0x92015c09275f6eb2ac347a84f01e9d0147dd15e5);
      votingInstance.addVoteOption("HeartBeat", 0x7849ffda2c0bc921d875251a69a69c9653366c00);
      votingInstance.addVoteOption("Save Stray Pets", 0x78232ed742b95E8d82eaA0A14Dd1EC10cAC49241);
      votingInstance.addVoteOption("VAD", 0x852df30ae98e7a95edc5bb268f27ccbf40f1d1ff);
    }).catch(function(err) {
      console.log(err.message);
    });

  },


  handleDisperse: function(event) {
    //if this method is called, the default action of the event will not be triggered
    event.preventDefault();
    var votingInstance;

    //use web3 to get the user's accounts:
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      // web3.eth.sendTransaction({from:accounts[0], to: "0xa753e76d6F3e02Df816267f6b07Cc3F14AB41dEb", value: 2000000000000000000}, function(err, result) {
      //   if (!err) {
      //     console.log("result" + result);
      //   } else {
      //     console.log("err" + err);
      //   }
      // });

      App.contracts.Charity.deployed().then(function(instance) {
        console.log("about to call");
        votingInstance = instance;
        console.log("about to disperse");
        votingInstance.disperse().then(function(result) {
          console.log("result" + result);
        }).catch(function(err) {
          console.log("err" + err);
        });
        console.log("after disperse");
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
