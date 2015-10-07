#!/usr/bin/env python3

import os
import sys
import shutil
import subprocess

if __name__ == '__main__':
  if len(sys.argv) == 1:
    print('Usage : {} flac-path [extension]'.format(sys.argv[0]))
    sys.exit(0)
  
  # read .flac files
  fdir = sys.argv[1]
  extension = 'flac' if len(sys.argv) < 3 else sys.argv[2]
  print(extension)
  end = '.{}'.format(extension)
  files = []
  for f in os.listdir(fdir):
    if f[0-len(end):] == end:
      print('\x1b[32mAddition of {}\x1b[0m'.format(f))
      files.append(f[:0-len(end)])
    else:
      print('\x1b[31mExclusion of {}\x1b[0m'.format(f))

  # identify output directory
  tmp = fdir.split('/')
  ndir = tmp.pop()
  while ndir == '': ndir = tmp.pop()
  print('Creating directory «{}»'.format(ndir))
  os.mkdir(ndir)

  # convert files
  i = 0
  for f in files:
    i += 1
    print('File {}/{} \x1b[34m{}\x1b[0m'.format(i,len(files),f))
    subprocess.check_call([
      'sox',
      os.path.join(fdir,'{}.{}'.format(f,extension)),
      os.path.join(ndir,'{}.ogg'.format(f)),
      ])

  # chown -R
  print('Changing permissions..')
  subprocess.check_call(['chown','-R','www-data:www-data',ndir])
