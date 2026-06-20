<?php
/**
 * view-leads.php
 * Password-protected viewer for the captured leads (leads/leads.csv).
 *
 * SETUP:
 *   1. Change the password below by generating a new hash:
 *        php -r "echo password_hash('YOUR_PASSWORD', PASSWORD_DEFAULT);"
 *      then paste the result into $PASSWORD_HASH.
 *   2. Visit  https://lp1.balwantkingra.com/view-leads.php  and log in.
 *
 * Default password is "changeme" — CHANGE IT before going live.
 */

session_start();

// ---- CONFIG ----
$PASSWORD_HASH = '$2y$05$JjehDgw3YGPMk355v/KjKeUtjGeHImx.K0m/FmW5HFDtH2VqO.0yy'; // "changeme" — REPLACE THIS
$CSV_FILE = __DIR__ . '/leads/leads.csv';

// ---- LOGOUT ----
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: view-leads.php');
    exit;
}

// ---- LOGIN HANDLING ----
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['password'])) {
    if (password_verify($_POST['password'], $PASSWORD_HASH)) {
        $_SESSION['leads_auth'] = true;
    } else {
        $error = 'Incorrect password.';
    }
}

$authed = !empty($_SESSION['leads_auth']);

// ---- CSV DOWNLOAD (only when authed) ----
if ($authed && isset($_GET['download'])) {
    if (file_exists($CSV_FILE)) {
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="caledon-leads-' . date('Y-m-d') . '.csv"');
        readfile($CSV_FILE);
        exit;
    }
}

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="noindex, nofollow" />
<title>Leads — Balwant Kingra</title>
<style>
  body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; margin: 0; background: #f5f5f5; color: #2b2b2b; }
  header { background: #0D1B2A; color: #fff; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; }
  header h1 { font-size: 18px; margin: 0; }
  header a { color: #fff; font-size: 14px; }
  .wrap { padding: 24px; }
  .login { max-width: 360px; margin: 80px auto; background: #fff; padding: 28px; border-radius: 12px; box-shadow: 0 6px 24px rgba(0,0,0,.08); }
  .login h2 { margin: 0 0 16px; color: #0D1B2A; }
  .login input { width: 100%; padding: 12px; font-size: 16px; border: 1px solid #ccc; border-radius: 8px; box-sizing: border-box; }
  .login button { width: 100%; margin-top: 12px; padding: 12px; background: #E2001A; color: #fff; border: 0; border-radius: 8px; font-size: 16px; font-weight: 700; cursor: pointer; }
  .err { color: #E2001A; font-size: 14px; margin-top: 10px; }
  .bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .count { font-weight: 700; color: #0D1B2A; }
  .btn-dl { background: #E2001A; color: #fff; text-decoration: none; padding: 9px 16px; border-radius: 8px; font-weight: 700; font-size: 14px; }
  table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,.06); font-size: 13px; }
  th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; white-space: nowrap; }
  th { background: #0D1B2A; color: #fff; position: sticky; top: 0; }
  tr:nth-child(even) td { background: #fafafa; }
  .scroll { overflow-x: auto; }
  .empty { background: #fff; padding: 40px; text-align: center; border-radius: 10px; color: #6b7280; }
</style>
</head>
<body>

<?php if (!$authed): ?>
  <form class="login" method="post">
    <h2>Leads Login</h2>
    <input type="password" name="password" placeholder="Enter password" autofocus required />
    <button type="submit">View Leads</button>
    <?php if ($error): ?><p class="err"><?php echo htmlspecialchars($error); ?></p><?php endif; ?>
  </form>
<?php else: ?>
  <header>
    <h1>Caledon Leads</h1>
    <a href="?logout=1">Log out</a>
  </header>
  <div class="wrap">
    <?php
    if (!file_exists($CSV_FILE)) {
        echo '<div class="empty">No leads captured yet.</div>';
    } else {
        $rows = array_map('str_getcsv', file($CSV_FILE));
        $headerRow = array_shift($rows);
        $rows = array_reverse($rows); // newest first
        ?>
        <div class="bar">
          <span class="count"><?php echo count($rows); ?> lead<?php echo count($rows) === 1 ? '' : 's'; ?></span>
          <a class="btn-dl" href="?download=1">Download CSV</a>
        </div>
        <div class="scroll">
          <table>
            <thead><tr>
              <?php foreach ($headerRow as $h): ?><th><?php echo htmlspecialchars($h); ?></th><?php endforeach; ?>
            </tr></thead>
            <tbody>
              <?php foreach ($rows as $r): ?>
                <tr><?php foreach ($r as $cell): ?><td><?php echo htmlspecialchars($cell); ?></td><?php endforeach; ?></tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
        <?php
    }
    ?>
  </div>
<?php endif; ?>

</body>
</html>
