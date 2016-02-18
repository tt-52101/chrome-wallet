angular.module('kkWallet')
  .controller('SendController', ['$scope', '$routeParams', 'DeviceBridgeService', 'NavigationService', 'WalletNodeService', 'TransactionService', 'FeeService',
    function SendController($scope, $routeParams, deviceBridgeService, navigationService, walletNodeService, transactionService, feeService) {
      walletNodeService.reload();

      feeService.update();

      $scope.fees = feeService.fees;
      $scope.feeOptions = feeService.feeOptions;

      $scope.feeDisplay = {
        'slow': '1-hour +',
        'medium': '30-min',
        'fast': '10-min'
      };

      $scope.estimatedFee = feeService.estimatedFee;
      $scope.maxAmount = feeService.maxTransactionAmount;

      $scope.wallet = walletNodeService.getWalletById($routeParams.wallet);
      $scope.userInput = {
        sourceIndex: $routeParams.wallet,
        sourceName: $scope.wallet.name,
        address: '',
        amount: '',
        feeLevel: $scope.feeOptions[0]
      };
      $scope.buildTransaction = function () {
        if ($scope.userInput.address && $scope.userInput.amount) {
          angular.copy($scope.userInput, transactionService.transactionInProgress);
          deviceBridgeService.requestTransactionSignature(transactionService.transactionInProgress);
          navigationService.setNextTransition('slideLeft');
        }
      };
      
      $scope.getMaxAmount = function () {
        return $scope.maxAmount.max / 100000000;
      };

      $scope.setFeeLevel = function (option) {
        $scope.userInput.feeLevel = option;
      };

      $scope.getFee = function (feeLevelOption) {
        var fee = $scope.estimatedFee.fee && $scope.estimatedFee.fee[feeLevelOption];

        if (_.isUndefined(fee)) {
          fee = 0.0;
        }

        return fee;
      }

      $scope.backDestination = '/wallet/' + $routeParams.wallet;

      getMaximumTransactionAmount();

      function computeFees() {
        feeService.compute($scope.wallet.nodePath, $scope.userInput.amount);
      }

      function getMaximumTransactionAmount() {
        feeService.getMaximumTransactionAmount($scope.wallet.nodePath, $scope.userInput.feeLevel);
      }

      function verifyFeeLevel() {
        var translation = {
          'fast': 'medium',
          'medium': 'slow',
          'slow': 'slow'
        };

        if ($scope.estimatedFee && $scope.estimatedFee.fee) {
          while (_.isUndefined($scope.estimatedFee.fee[$scope.userInput.feeLevel])) {
            $scope.userInput.feeLevel = translation[$scope.userInput.feeLevel];
            if ($scope.userInput.feeLevel === 'slow') {
              break;
            }
          }
        }
      }

      $scope.$watch('userInput.amount', computeFees);
      $scope.$watch('estimatedFee', verifyFeeLevel, true);
      $scope.$watch('estimatedFee', getMaximumTransactionAmount, true);
    }
  ]);
