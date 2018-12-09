# Extension for Foswiki - The Free and Open Source Wiki, http://foswiki.org/
#
# JQAutoLogoutContrib is Copyright (C) 2018 Michael Daum http://michaeldaumconsulting.com
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details, published at
# http://www.gnu.org/copyleft/gpl.html

package Foswiki::Contrib::JQAutoLogoutContrib::Core;

use strict;
use warnings;

use Foswiki::Func ();

use Foswiki::Plugins::JQueryPlugin::Plugin ();
our @ISA = qw( Foswiki::Plugins::JQueryPlugin::Plugin );

sub new {
  my $class = shift;

  my $this = bless(
    $class->SUPER::new(
      name => 'JQAutoLogoutContrib',
      version => '1.02',
      author => 'Michael Daum',
      homepage => 'http://foswiki.org/Extensions/JQAutoLogoutContrib',
      javascript => ['autologout.js'],
      puburl => '%PUBURLPATH%/%SYSTEMWEB%/JQAutoLogoutContrib',
      dependencies => ['ui::dialog'],
    ),
    $class
  );

  $this->{_doneReadTemplate} = 0;
  return $this;
}

sub init {
    my $this = shift;

    return unless $this->SUPER::init();

    unless ($this->{_doneReadTemplate}) {
      $this->{_doneReadTemplate} = 1;
      Foswiki::Func::readTemplate("autologout");
    }

    my $tmpl = Foswiki::Func::expandTemplate("autologout::dialog");

    Foswiki::Func::addToZone("body", "JQUERYPLUGIN::JQAUTOLOGOUTCONTRIB::DIALOG", $tmpl);
}

1;
