<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Loans</title>
<link rel="stylesheet" href="css/style.css">
</head>

<body>

<h2>Loans</h2>

<input id="memberId" placeholder="Member ID">
<input id="memberName" placeholder="Name">
<input id="amount" type="number" placeholder="Amount">
<input id="duration" type="number" placeholder="Duration (months)">

<button id="addLoanBtn">Request Loan</button>

<h3>Pending Loans</h3>
<div id="pendingList"></div>

<a href="dashboard.html">Back</a>

<script type="module" src="js/loans.js"></script>

</body>
</html>
