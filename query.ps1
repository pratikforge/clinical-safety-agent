$ideas = @(
    '"revenge bedtime procrastination" app site:reddit.com',
    '"new year resolution" overwhelm fail site:reddit.com',
    '"racing mind" sleep wind down app site:reddit.com',
    '"to do list" stagnation stale tasks site:reddit.com',
    '"maintaining friendships" busy professional app site:reddit.com',
    '"travel packing" stress list app site:reddit.com',
    '"read it later guilt" app site:reddit.com',
    '"forgot to cancel subscription" app site:reddit.com'
)

$session = "evaluate-ideas"

for ($i = 0; $i -lt $ideas.Length; $i++) {
    $idea = $ideas[$i]
    $encoded = [uri]::EscapeDataString($idea)
    $url = "https://www.google.com/search?q=$encoded"
    
    $reqFile = "$env:TEMP\webbridge-req-nav-$i.json"
    $req = @{
        action = "navigate"
        session = $session
        args = @{
            url = $url
            newTab = ($i -eq 0)
        }
    }
    if ($i -eq 0) {
        $req.args.group_title = "Evaluate Ideas"
    }
    [System.IO.File]::WriteAllText($reqFile, ($req | ConvertTo-Json -Depth 10))
    Write-Host "Navigating to $url"
    curl.exe -s -X POST http://127.0.0.1:10086/command -H "Content-Type: application/json" --data-binary "@$reqFile" | Out-Null
    
    Start-Sleep -Seconds 4
    
    $snapReqFile = "$env:TEMP\webbridge-req-snap-$i.json"
    $snapReq = @{
        action = "snapshot"
        session = $session
        args = @{}
    }
    [System.IO.File]::WriteAllText($snapReqFile, ($snapReq | ConvertTo-Json -Depth 10))
    curl.exe -s -X POST http://127.0.0.1:10086/command -H "Content-Type: application/json" --data-binary "@$snapReqFile" | Out-File -FilePath "c:\Cap-KxG\snapshot_$i.json" -Encoding ascii
}

$closeReqFile = "$env:TEMP\webbridge-req-close.json"
$closeReq = @{
    action = "close_session"
    session = $session
}
[System.IO.File]::WriteAllText($closeReqFile, ($closeReq | ConvertTo-Json -Depth 10))
curl.exe -s -X POST http://127.0.0.1:10086/command -H "Content-Type: application/json" --data-binary "@$closeReqFile" | Out-Null
