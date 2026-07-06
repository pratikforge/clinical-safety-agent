$utf8NoBom = New-Object System.Text.UTF8Encoding $False

& "$env:USERPROFILE\.kimi-webbridge\bin\kimi-webbridge.exe" start
Start-Sleep -Seconds 3

$queries = @(
    'https://html.duckduckgo.com/html/?q=site:reddit.com+"missed+calls"+(plumber+OR+hvac+OR+"service+business")+revenue',
    'https://html.duckduckgo.com/html/?q=site:reddit.com+"speed+to+lead"+conversion+"small+business"',
    'https://html.duckduckgo.com/html/?q=site:reddit.com+"bad+review"+"small+business"+cost',
    'https://html.duckduckgo.com/html/?q=site:reddit.com+"late+paying+clients"+OR+"accounts+receivable"+"cash-flow"',
    'https://html.duckduckgo.com/html/?q=site:reddit.com+"event+rental"+"inventory+tracking"',
    'https://html.duckduckgo.com/html/?q=site:reddit.com+B2B+"cold+outreach"+"personalize"+scale',
    'https://html.duckduckgo.com/html/?q=site:reddit.com+"fractional+digital+marketing"+budget'
)

for ($i=0; $i -lt $queries.Length; $i++) {
    $url = $queries[$i]
    $reqFile = "$env:TEMP\req_nav_$i.json"
    $req = '{"action":"navigate","args":{"url":"' + $url + '","newTab":true,"group_title":"Idea ' + ($i+1) + '"},"session":"idea-evaluation"}'
    [IO.File]::WriteAllText($reqFile, $req, $utf8NoBom)
    
    Write-Host "Navigating to Idea $i..."
    curl.exe -s -X POST http://127.0.0.1:10086/command -H "Content-Type: application/json" --data-binary "@$reqFile" | Out-Null
    
    Start-Sleep -Seconds 5
    
    $snapReqFile = "$env:TEMP\req_snap_$i.json"
    $snapReq = '{"action":"snapshot","args":{},"session":"idea-evaluation"}'
    [IO.File]::WriteAllText($snapReqFile, $snapReq, $utf8NoBom)
    
    Write-Host "Taking snapshot for Idea $i..."
    $snapOut = curl.exe -s -X POST http://127.0.0.1:10086/command -H "Content-Type: application/json" --data-binary "@$snapReqFile"
    [IO.File]::WriteAllText("c:\Cap-KxG\idea_$i.json", $snapOut, $utf8NoBom)
}

$closeReqFile = "$env:TEMP\req_close.json"
$closeReq = '{"action":"close_session","args":{},"session":"idea-evaluation"}'
[IO.File]::WriteAllText($closeReqFile, $closeReq, $utf8NoBom)
curl.exe -s -X POST http://127.0.0.1:10086/command -H "Content-Type: application/json" --data-binary "@$closeReqFile" | Out-Null

Write-Host "Done!"
