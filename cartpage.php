<HTML>
<?php
  session_start();
  error_reporting(1);
  include("config.php");
  include("header.php");
  if(isset($_POST['']))
  {
    if(isset($_SESSION['user_info']) && is_array($_SESSION['user_info']))	{
      $_SESSION['check']='1';
    }
  }
?>
<HEAD>
<TITLE>Paniers Green Therapy</TITLE>
<LINK REL="STYLESHEET" HREF="STYLE.CSS">
<meta name="description" content="">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="css/main.css">
<link href='http://fonts.googleapis.com/css?family=Roboto:400,300,500' rel='stylesheet' type='text/css'>
<link href="//netdna.bootstrapcdn.com/font-awesome/4.1.0/css/font-awesome.min.css" rel="stylesheet">
<script src="js/jquery-1.8.2.min.js"></script>
<script src="js/jquery.validate.min.js"></script>
<script src="js/main.js"></script>
<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.3.1/css/bootstrap.min.css">
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.3.1/js/bootstrap.bundle.min.js"></script>
<link rel="stylesheet" type="text/css" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
<div class="px-4 px-lg-1">
  <div class="pb-5">
    <div class="container">
      <div class="row">
        <div class="col-lg-12 p-5 bg-white rounded shadow-sm mb-5">

          <!-- Shopping cart table -->
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th scope="col" class="border-0 bg-light">
                    <div class="p-2 px-3 text-uppercase">Produits</div>
                  </th>
                  <th scope="col" class="border-0 bg-light">
                    <div class="py-2 text-uppercase">Prix</div>
                  </th>
                  <th scope="col" class="border-0 bg-light">
                    <div class="py-2 text-uppercase">Quantité</div>
                  </th>
                  <th scope="col" class="border-0 bg-light">
                    <div class="py-2 text-uppercase">Supprimer</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <?php

                  if(!empty($_SESSION['user_info'])) {

                    $user_info=$_SESSION['user_info'];
                    $sql1="SELECT * FROM orders WHERE email = '" . $user_info . "'";

                    /* Vérification de la connexion */
                    if (mysqli_connect_errno()) {
                      printf("Echec de la connexion : %s\n", mysqli_connect_error());
                      exit();
                    }
                    
                    if(mysqli_query($connection ,$sql1))
                    {  
                      $order = mysqli_fetch_assoc(mysqli_query($connection, $sql1));
                      if($order['qty1'] > 0){
                          $qtyValue = $order['qty1'];
                          $price = $order['qty1'] * 10.80;
                        ?>
                          <tr>
                          <th scope="row" class="border-0">
                            <div class="p-2">
                              <img src="menu\resine.jpg" alt="" width="70" class="img-fluid rounded shadow-sm">
                              <div class="ml-3 d-inline-block align-middle">
                                <h5 class="mb-0"> <a href="#" class="text-dark d-inline-block align-middle">Bonbons</a></h5><span class="text-muted font-weight-normal font-italic d-block">Catégorie: Confisserie</span>
                              </div>
                            </div>
                          </th>
                          <td class="border-0 align-middle"><strong><?php echo $price . "€" ;?></strong></td>
                          <td class="border-0 align-middle"><strong><?php echo $qtyValue ;?></strong></td>
                          <td class="border-0 align-middle"><a href="deleteorder.php?idQty='qty1'" class="text-dark"><i class="fa fa-trash"></i></a>
                        </tr>
                      <?php
                      }
                      if($order['qty2'] > 0){
                        $qtyValue = $order['qty2'];
                        $price = $order['qty2'] * 29.80;
                      ?>
                        <tr>
                        <th scope="row" class="border-0">
                          <div class="p-2">
                            <img src="menu\massage.png" alt="" width="70" class="img-fluid rounded shadow-sm">
                            <div class="ml-3 d-inline-block align-middle">
                              <h5 class="mb-0"> <a href="#" class="text-dark d-inline-block align-middle">Huile de Massage</a></h5><span class="text-muted font-weight-normal font-italic d-block">Catégorie: Huiles Essentielles</span>
                            </div>
                          </div>
                        </th>
                        <td class="border-0 align-middle"><strong><?php echo $price . "€" ;?></strong></td>
                        <td class="border-0 align-middle"><strong><?php echo $qtyValue ;?></strong></td>
                        <td class="border-0 align-middle"><a href="deleteorder.php?idQty='qty2'" class="text-dark"><i class="fa fa-trash"></i></a>
                        </td>
                      </tr>
                      <?php
                      }
                      if($order['qty3'] > 0){
                        $qtyValue = $order['qty3'];
                        $price = $order['qty3'] * 12;
                      ?>
                        <tr>
                        <th scope="row" class="border-0">
                          <div class="p-2">
                            <img src="menu\herbe.jpg" alt="" width="70" class="img-fluid rounded shadow-sm">
                            <div class="ml-3 d-inline-block align-middle">
                              <h5 class="mb-0"> <a href="#" class="text-dark d-inline-block align-middle">Vitamine</a></h5><span class="text-muted font-weight-normal font-italic d-block">Catégorie: Vitamines</span>
                            </div>
                          </div>
                        </th>
                        <td class="border-0 align-middle"><strong><?php echo $price . "€" ;?></strong></td>
                        <td class="border-0 align-middle"><strong><?php echo $qtyValue ;?></strong></td>
                        <td class="border-0 align-middle"><a href="deleteorder.php?idQty='qty3'" class="text-dark"><i class="fa fa-trash"></i></a>
                      </tr>
                      <?php
                      }
                      if($order['qty4'] > 0){
                        $qtyValue = $order['qty4'];
                        $price = $order['qty4'] * 25;
                      ?>
                        <tr>
                        <th scope="row" class="border-0">
                          <div class="p-2">
                            <img src="menu\eliquid.jpg" alt="" width="70" class="img-fluid rounded shadow-sm">
                            <div class="ml-3 d-inline-block align-middle">
                              <h5 class="mb-0"> <a href="#" class="text-dark d-inline-block align-middle">E-Liquide</a></h5><span class="text-muted font-weight-normal font-italic d-block">Catégorie: HIGH-TECH</span>
                            </div>
                          </div>
                        </th>
                        <td class="border-0 align-middle"><strong><?php echo $price . "€" ;?></strong></td>
                        <td class="border-0 align-middle"><strong><?php echo $qtyValue ;?></strong></td>
                        <td class="border-0 align-middle"><a href="deleteorder.php?idQty='qty4'" class="text-dark"><i class="fa fa-trash"></i></a>
                      </tr>
                      <?php
                      }
                      if($order['qty5'] > 0){
                        $qtyValue = $order['qty5'];
                        $price = $order['qty5'] * 5.99;
                      ?>
                        <tr>
                        <th scope="row" class="border-0">
                          <div class="p-2">
                            <img src="menu\chocolat.jpg" alt="" width="70" class="img-fluid rounded shadow-sm">
                            <div class="ml-3 d-inline-block align-middle">
                              <h5 class="mb-0"> <a href="#" class="text-dark d-inline-block align-middle">Chocolat</a></h5><span class="text-muted font-weight-normal font-italic d-block">Catégorie: Confisserie</span>
                            </div>
                          </div>
                        </th>
                        <td class="border-0 align-middle"><strong><?php echo $price . "€" ;?></strong></td>
                        <td class="border-0 align-middle"><strong><?php echo $qtyValue ;?></strong></td>
                        <td class="border-0 align-middle"><a href="deleteorder.php?idQty='qty5'" class="text-dark"><i class="fa fa-trash"></i></a>
                      </tr>
                      <?php
                      }
                      if($order['qty6'] > 0){
                        $qtyValue = $order['qty6'];
                        $price = $order['qty6'] * 9.99;
                      ?>
                        <tr>
                        <th scope="row" class="border-0">
                          <div class="p-2">
                            <img src="menu\infusion.png" alt="" width="70" class="img-fluid rounded shadow-sm">
                            <div class="ml-3 d-inline-block align-middle">
                              <h5 class="mb-0"> <a href="#" class="text-dark d-inline-block align-middle">Infusion</a></h5><span class="text-muted font-weight-normal font-italic d-block">Catégorie: Infusion</span>
                            </div>
                          </div>
                        </th>
                        <td class="border-0 align-middle"><strong><?php echo $price . "€" ;?></strong></td>
                        <td class="border-0 align-middle"><strong><?php echo $qtyValue ;?></strong></td>
                        <td class="border-0 align-middle"><a href="deleteorder.php?idQty='qty6'" class="text-dark"><i class="fa fa-trash"></i></a>
                      </tr>
                      <?php
                      }
                      if($order['qty7'] > 0){
                        $qtyValue = $order['qty7'];
                        $price = $order['qty7'] * 8.99;
                      ?>
                        <tr>
                        <th scope="row" class="border-0">
                          <div class="p-2">
                            <img src="menu\seeds.jpg" alt="" width="70" class="img-fluid rounded shadow-sm">
                            <div class="ml-3 d-inline-block align-middle">
                              <h5 class="mb-0"> <a href="#" class="text-dark d-inline-block align-middle">Graines</a></h5><span class="text-muted font-weight-normal font-italic d-block">Catégorie: Graines</span>
                            </div>
                          </div>
                        </th>
                        <td class="border-0 align-middle"><strong><?php echo $price . "€" ;?></strong></td>
                        <td class="border-0 align-middle"><strong><?php echo $qtyValue ;?></strong></td>
                        <td class="border-0 align-middle"><a href="deleteorder.php?idQty='qty7'" class="text-dark"><i class="fa fa-trash"></i></a>
                      </tr>
                      <?php
                      }
                      if($order['qty8'] > 0){
                        $qtyValue = $order['qty8'];
                        $price = $order['qty8'] * 10.99;
                      ?>
                        <tr>
                        <th scope="row" class="border-0">
                          <div class="p-2">
                            <img src="menu\the.jpg" alt="" width="70" class="img-fluid rounded shadow-sm">
                            <div class="ml-3 d-inline-block align-middle">
                              <h5 class="mb-0"> <a href="#" class="text-dark d-inline-block align-middle">Thé</a></h5><span class="text-muted font-weight-normal font-italic d-block">Catégorie: Infusions</span>
                            </div>
                          </div>
                        </th>
                        <td class="border-0 align-middle"><strong><?php echo $price . "€" ;?></strong></td>
                        <td class="border-0 align-middle"><strong><?php echo $qtyValue ;?></strong></td>
                        <td class="border-0 align-middle"><a href="deleteorder.php?idQty='qty8'" class="text-dark"><i class="fa fa-trash"></i></a>
                      </tr>
                      <?php
                      }
                      if($order['qty9'] > 0){
                        $qtyValue = $order['qty9'];
                        $price = $order['qty9'] * 29.99;
                      ?>
                        <tr>
                        <th scope="row" class="border-0">
                          <div class="p-2">
                            <img src="menu\oil.jpg" alt="" width="70" class="img-fluid rounded shadow-sm">
                            <div class="ml-3 d-inline-block align-middle">
                              <h5 class="mb-0"> <a href="#" class="text-dark d-inline-block align-middle">Huile</a></h5><span class="text-muted font-weight-normal font-italic d-block">Catégorie: Huile Essentielles</span>
                            </div>
                          </div>
                        </th>
                        <td class="border-0 align-middle"><strong><?php echo $price . "€" ;?></strong></td>
                        <td class="border-0 align-middle"><strong><?php echo $qtyValue ;?></strong></td>
                        <td class="border-0 align-middle"><a href="deleteorder.php?idQty='qty9'" class="text-dark"><i class="fa fa-trash"></i></a>
                      </tr>
                      <?php
                      }
                    }
                  }
                  ?>
              </tbody>
            </table>
          </div>
          <!-- End -->
        </div>
      </div>

      <div class="row py-5 p-4 bg-white rounded shadow-sm">
        <div class="col-lg-6">
          <div class="bg-light rounded-pill px-4 py-3 text-uppercase font-weight-bold">Code Coupon</div>
          <div class="p-4">
            <p class="font-italic mb-4">If you have a coupon code, please enter it in the box below</p>
            <div class="input-group mb-4 border rounded-pill p-2">
              <input type="text" placeholder="Apply coupon" aria-describedby="button-addon3" class="form-control border-0">
              <div class="input-group-append border-0">
                <button id="button-addon3" type="button" class="btn btn-dark px-4 rounded-pill"><i class="fa fa-gift mr-2"></i>Apply coupon</button>
              </div>
            </div>
          </div>
          <div class="bg-light rounded-pill px-4 py-3 text-uppercase font-weight-bold">Instructions for seller</div>
          <div class="p-4">
            <p class="font-italic mb-4">If you have some information for the seller you can leave them in the box below</p>
            <textarea name="" cols="30" rows="2" class="form-control"></textarea>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="bg-light rounded-pill px-4 py-3 text-uppercase font-weight-bold">Order summary </div>
          <div class="p-4">
            <p class="font-italic mb-4">Shipping and additional costs are calculated based on values you have entered.</p>
            <ul class="list-unstyled mb-4">
              <li class="d-flex justify-content-between py-3 border-bottom"><strong class="text-muted">Order Subtotal </strong><strong>$390.00</strong></li>
              <li class="d-flex justify-content-between py-3 border-bottom"><strong class="text-muted">Shipping and handling</strong><strong>$10.00</strong></li>
              <li class="d-flex justify-content-between py-3 border-bottom"><strong class="text-muted">Tax</strong><strong>$0.00</strong></li>
              <li class="d-flex justify-content-between py-3 border-bottom"><strong class="text-muted">Total</strong>
                <h5 class="font-weight-bold">$400.00</h5>
              </li>
            </ul><a href="#" class="btn btn-dark rounded-pill py-2 btn-block">Procceed to checkout</a>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>