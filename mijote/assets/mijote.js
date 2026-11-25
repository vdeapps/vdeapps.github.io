// Page d'accueil de Mijote : curseur « Mettre au propre », apparitions au défilement, liste à cocher.
// Aucun réseau, aucune donnée enregistrée.
(function () {
  'use strict';

  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!calme) document.documentElement.classList.add('anime');

  // ---------- Curseur papier / Mijote ----------
  var fiche = document.getElementById('fiche');
  if (fiche) {
    var curseur = fiche.querySelector('input');
    var poser = function (v) { fiche.style.setProperty('--coupe', v + '%'); };
    var touche = false;
    curseur.addEventListener('input', function () { touche = true; poser(curseur.value); });
    poser(curseur.value);

    // Démonstration, une seule fois : le papier passe au propre puis la fiche s'arrête à mi-chemin.
    if (!calme) {
      var etapes = [[0, 0], [1500, 100], [900, 55]];
      var depart = null, de = 0, i = 0;
      poser(0);
      var lisse = function (t) { return 1 - Math.pow(1 - t, 4); };
      var image = function (now) {
        if (touche) return;
        if (depart === null) depart = now;
        var duree = etapes[i][0], vers = etapes[i][1];
        var t = duree ? Math.min(1, (now - depart) / duree) : 1;
        var v = de + (vers - de) * lisse(t);
        poser(v.toFixed(2));
        if (t >= 1) {
          de = vers; i += 1; depart = now;
          if (i >= etapes.length) { curseur.value = 55; return; }
        }
        requestAnimationFrame(image);
      };
      setTimeout(function () { requestAnimationFrame(image); }, 1300);
    }
  }

  // ---------- Apparitions au défilement ----------
  var cibles = document.querySelectorAll('.revele, .etape, .fin');
  if (!calme && 'IntersectionObserver' in window) {
    var vu = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('vu'); vu.unobserve(e.target); }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
    cibles.forEach(function (c) { vu.observe(c); });
  } else {
    cibles.forEach(function (c) { c.classList.add('vu'); });
  }

  // ---------- Liste des ingrédients ----------
  var liste = document.getElementById('liste');
  if (liste) {
    var cases = liste.querySelectorAll('input');
    var compte = document.getElementById('compte');
    var jauge = document.getElementById('jauge');
    var bravo = document.getElementById('bravo-liste');
    var majListe = function () {
      var n = 0;
      cases.forEach(function (c) { if (c.checked) n += 1; });
      compte.textContent = n + ' / ' + cases.length + ' prêts';
      jauge.style.setProperty('--fait', n / cases.length);
      bravo.textContent = n === cases.length ? 'Tout est prêt. Il ne reste qu’à installer Mijote.' : '';
    };
    liste.addEventListener('change', majListe);
    majListe();
  }
})();
