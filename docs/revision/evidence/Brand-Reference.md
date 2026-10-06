# Deep Focus — Brand Reference

මෙය ලබාදුන් visual identity එක ඉදිරි වැඩ සඳහා නැවත සොයාගත හැකි durable project reference සටහනකි. අලුත් logo design එකක් හෝ approved design-token migration එකක් නොවේ. Images මුල් local paths වෙත link කර ඇත; ඒ files වෙනත් තැනකට ගෙන ගියොත් links update කළ යුතුය.

## 1. Primary identity

![Deep Focus coral-center logo](C:/Users/User/Downloads/Deep%20Focus%20Coral%20Center.png)

[Original logo image](<C:/Users/User/Downloads/Deep Focus Coral Center.png>)

රැකගත යුතු visual characteristics:

- Dark navy field එකක් මත concentric blue/pale arcs තුනක්.
- පහළින් විවෘත arcs සහ මධ්‍යයට converging pale paths දෙකක්.
- මධ්‍ය focal point එක coral/red dot එකකි.
- Spacious uppercase DEEP FOCUS wordmark.
- Exact supplied tagline: **Focus on What Matters.**

අර්ථකථනය ලෙස arcs අවධානය රැකෙන වටපිටාවක් සහ paths අරමුණකට පිවිසීමක් ලෙස කියවිය හැක. මෙය designerගේ තහවුරු කළ අර්ථයක් නොව visual interpretation එකකි.

## 2. Light සහ dark lockup / atmosphere

![Deep Focus light and dark visual reference](C:/Users/User/Downloads/ChatGPT%20Image%20Sep%2012,%202026,%2002_01_51%20AM.png)

[Original light/dark reference](<C:/Users/User/Downloads/ChatGPT Image Sep 12, 2026, 02_01_51 AM.png>)

| අංගය | Light reference | Dark reference |
| --- | --- | --- |
| Background atmosphere | pale, airy sunrise සහ soft mountains | deep navy, moonlit mountains සහ quiet landscape |
| DEEP | dark navy | white / very light neutral |
| FOCUS | bright blue | blue |
| Logo | blue arcs, dark lower paths, coral center | blue/pale arcs සහ paths, coral center |
| Tagline | muted blue | pale/muted blue |
| Overall character | calm, fresh, motivating | calm, focused, composed |

Reference එකේ descriptive slogans සහ handwritten quotes marketing artwork කොටස්ය. ඒවා app navigation, timer, task list හෝ every-screen decoration බවට පත් කිරීමට අවශ්‍ය නැත. Timer screen එකේ අවධානය timer/task/controls වෙත යොමු විය යුතුය.

## 3. Current sources අතර conflict

| Source | දැනට පෙනෙන direction | Status |
| --- | --- | --- |
| Approved UI/component docs | mint primary #7FE5B6, navy surfaces, lavender AI accent | documented baseline |
| Supplied visual identity | blue/pale arcs + coral center, blue FOCUS word | brand reference from project owner |
| Current user-edited tokens | primary blue #3B82F6; light #F8FAFC; dark #0B1220 / #111827 / #1F2937 | existing uncommitted work, preserved |

Token names සමහරක් තවම mint ලෙස ඇති අතර values blue වී ඇත. මෙය future maintainability issue එකක් විය හැක; rename කිරීම පවා approved migration එක සමඟ කළ යුතුය. මේ memo එක approved docs override නොකරයි.

Current home implementation එක full raster asset එක crop කර small rounded frame එකක් තුළ භාවිත කරයි. Wordmark blue treatment එක supplied split DEEP/FOCUS lockup එකට සම්පූර්ණයෙන් ගැළපෙන්නේ නැත. Welcome/splash/scaffold imagery එකේ consistency ද පසුව review කළ යුතුය. මෙය static implementation observation එකකි; real-device visual QA pass එකක් නොවේ.

## 4. නිර්දේශිත asset system — owner approval පසු

1. Existing identity faithfully trace/refine කළ canonical vector mark එකක්; AI redesign කිරීමෙන් geometry අහඹුවෙන් වෙනස් නොකරන්න.
2. Mark-only, horizontal lockup සහ stacked lockup වෙන වෙනම assets.
3. Light, dark සහ monochrome variants; small-size optical adjustment අවශ්‍ය නම් explicit specification.
4. 16, 24, 32 සහ 48 px clarity checks; app icon masking/safe-area checks.
5. Clear-space/minimum-size rules සහ single canonical tagline spelling/punctuation.
6. Approved token mapping: brand blue, coral focal accent, semantic error/success colors සහ AI accent වෙන් කරන්න.
7. Contrast/dynamic text/reduced-motion verification. Coral dot හෝ color එක පමණක් status information ගෙන නොයන්න.

Images වලින් exact production hex palette extract කර තහවුරු කළ බවක් නොවේ. ඉහත hex values දක්වා ඇත්තේ documents/current code සඳහාය. Production palette එක actual contrast testing සහ owner-approved design decision එකකින් පසුව freeze කළ යුතුය.

## 5. Brand promise සහ copy

Canonical existing tagline: **Focus on What Matters.**

Research positioning proposal: **Start clearly. Work quietly. Return easily.**

දෙවන වාක්‍යය product value explain කරන provisional supporting copy එකකි; tagline replacement එකක් නොවේ. Brand එක මතක තබාගැනීමේ ක්‍රමය මේ file-based reference එකයි—සෑම අලුත් conversation එකකම ස්වයංක්‍රීය permanent memory තිබෙන බවට පොරොන්දුවක් නොවේ.

Linked context: [full market/product report](<./Deep-Focus-Market-Research-SI.md>), [repository/evidence audit](<./Evidence-and-Repository-Audit.md>).


