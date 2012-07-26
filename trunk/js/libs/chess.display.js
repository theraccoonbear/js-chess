var Display = Class.extend({
	constructor: function(disp_options) {
		this.options = {
			animateDelay: 100,
			boardSelector: '#board',
			captureListSelector: '#captureList'
		};
		
		$.extend(this.options, disp_options);
		
	  this.$board = $(this.options.boardSelector);
		this.$captured = $(this.options.captureListSelector);
		this.$captured.html('');
		this.$whiteCapture = $('<ul class="fleft"></ul>');
		this.$blackCapture = $('<ul class="fleft"></ul>');
		this.$captured.append(this.$whiteCapture);
		this.$captured.append(this.$blackCapture);
		this.$board.html('');
		
		this.dummyPiece = new PawnPiece('white','pawn',0,0);
		this.empty = [
		  [null,null,null,null,null,null,null,null],
			[null,null,null,null,null,null,null,null],
			[null,null,null,null,null,null,null,null],
			[null,null,null,null,null,null,null,null],
			[null,null,null,null,null,null,null,null],
			[null,null,null,null,null,null,null,null],
			[null,null,null,null,null,null,null,null],
			[null,null,null,null,null,null,null,null]
		];
		//this.displayBoard();
	},
	displayBoard: function(b) {
		var board = typeof b === 'undefined' ? this.empty : b;
		var mkup = [];
		var color = true;
		var ranks = [8,7,6,5,4,3,2,1];
		var files = ['a','b','c','d','e','f','g','h'];
		
		
		mkup.push('<table class="chessBoard">');
		
		mkup.push('<tr>');
		mkup.push('<td class="boardLabel spacer">&nbsp;</td>');
		for (var x = 0; x < 8; x++) {
			mkup.push('<td class="boardLabel file">' + files[x] + '</td>');
		}
		mkup.push('<td class="boardLabel spacer">&nbsp;</td>');
		mkup.push('</tr>');
		
		for (var y = 0; y < 8; y++) {
			mkup.push('<tr class="y' + y + '">');
			mkup.push('<td class="boardLabel rank">' + ranks[y] + '</td>');
			for (var x = 0; x < 8; x++) {
				var p = board[x][y];
				var tp = '';
				if (p != null && typeof p !== 'undefined') {
					tp += '<div class="piece ' + p.color + ' ' + p.type + '" title="' + p.toString() + '">' + '&nbsp;' + '</div>';
				}
				
				//mkup.push('<td title="' + x + ', ' + y + '" class="boardSquare ' + (color ? 'white' : 'black') + ' x' + x + '" data-x="' + x + '" data-y="' + y + '">' + tp + '</td>');
				mkup.push('<td title="' + this.dummyPiece.position({'x':x,'y':y}) + '" class="boardSquare ' + (color ? 'white' : 'black') + ' x' + x + '" data-x="' + x + '" data-y="' + y + '">' + tp + '</td>');
				color = !color;
			}
			mkup.push('<td class="boardLabel rank">' + ranks[y] + '</td>');
			color = !color;
			mkup.push('</tr>');
		}
		
		mkup.push('<tr>');
		mkup.push('<td class="boardLabel spacer">&nbsp;</td>');
		for (var x = 0; x < 8; x++) {
			mkup.push('<td class="boardLabel file">' + files[x] + '</td>');
		}
		mkup.push('<td class="boardLabel spacer">&nbsp;</td>');
		mkup.push('</tr>');
		
		mkup.push('</table>');
		
		this.$board.html(mkup.join(''));
	},
	capturePiece: function(x, y, board) {
		var p = this.$board.find('.y' + y + ' .x' + x + ' div.piece').remove();
		var p_obj = board[x][y];
		if (p.length > 0) {
			if (p.length >= 1) {
				if (p_obj != null) { p.attr('title', p_obj.color + ' ' + p_obj.type); }
				if (p_obj.color == 'white') {
					this.$whiteCapture.prepend(p);
				} else {
					this.$blackCapture.prepend(p);
				}
			}
			return true;
		} else {
			return false;
		}
	},
	move: function(x1, y1, x2, y2, game, opts) {
		var ctxt = this;
		var o = {callback: true, castling: false};
		ctxt.game = game;
		var board = game.board;
		var p_obj = board[x1][y1];
		var d_obj = board[x2][y2];
		
		$.extend(o, opts);
		
		var $orig = this.$board.find('.y' +  y1 + ' .x' + x1);
		var $dest = this.$board.find('.y' +  y2 + ' .x' + x2);
		
		var sp = {
			left: $orig.offset().left,
			top: $orig.offset().top
		};
		
		var ep = {
			left: $dest.offset().left,
			top: $dest.offset().top
		};
		
		var $p = $orig.find('div.piece');
		var $d = $dest.find('div.piece');
		
		var piece = $p.remove();
		
		var dist_traveled = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
		if (o.castling) {
			dist_traveled = 2;
		}
		
		this.$board.parent().prepend(piece);
		
		piece
		.css({'left':sp.left,'top': sp.top,'position':'absolute'})
		.animate({'left': ep.left, 'top': ep.top}, Math.ceil(dist_traveled) * this.options.animateDelay , function() {
		  piece.css({'position':'static'});
			
			
			ctxt.capturePiece(x2, y2, board);
			
			piece.attr('title', p_obj.toString());
			ctxt.$board.find('.y' + y2 + ' .x' + x2).append(piece);
			
			if (p_obj.type == 'pawn') {
				if ((p_obj.color == 'black' && p_obj.y == 7) || (p_obj.color == 'white' && p_obj.y == 0)) {
					ctxt.promote(p_obj);
				}
			}
			
			if (o.callback !== false) {
				game.displayDone();
			}
		});
	},
	promote: function(p_obj) {
		var $p = this.$board.find('.y' + p_obj.y + ' .x' + p_obj.x + ' div.piece');
		$p.removeClass('pawn').addClass('queen').attr('title', p_obj.toString());;
	}
}); // Display
